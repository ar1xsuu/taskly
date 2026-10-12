// TASKLY System Administrator API (Vercel serverless function).
// Add the SECRET env var SUPABASE_SERVICE_ROLE_KEY in Vercel (Settings > Environment Variables), then redeploy.
// SUPABASE_URL is optional. Only accounts whose profile role is 'sysadmin' can use this.
const BASE = (process.env.SUPABASE_URL || 'https://hqmbboqecfmcviqsfutv.supabase.co').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROLES = ['teacher', 'head', 'sysadmin'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function sb(path, method, body, extra) {
  const r = await fetch(BASE + path, {
    method: method || 'GET',
    headers: Object.assign({ apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, extra || {}),
    body: body ? JSON.stringify(body) : undefined
  });
  const t = await r.text();
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch (e) { j = { message: t }; }
  if (!r.ok) throw new Error((j && (j.msg || j.message || j.error_description || j.error)) || 'Request failed (' + r.status + ')');
  return j;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  if (!KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set in Vercel.' });
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Sign in first.' });
    const who = await fetch(BASE + '/auth/v1/user', { headers: { apikey: KEY, Authorization: 'Bearer ' + token } }).then(r => (r.ok ? r.json() : null));
    if (!who || !who.id) return res.status(401).json({ error: 'Your session expired. Sign in again.' });
    const me = (await sb('/rest/v1/profiles?id=eq.' + who.id + '&select=id,role,full_name'))[0];
    if (!me || me.role !== 'sysadmin') return res.status(403).json({ error: 'Only the System Administrator can do this.' });

    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const log = (action, target, detail) =>
      sb('/rest/v1/audit_log', 'POST', { actor: me.id, actor_name: me.full_name, action, target: target || null, detail: detail || null }, { Prefer: 'return=minimal' }).catch(() => {});
    const needId = () => { if (!UUID.test(b.id || '')) throw new Error('Missing account.'); };
    const admins = async () => (await sb('/rest/v1/profiles?role=eq.sysadmin&select=id')).length;

    if (b.action === 'list') {
      const users = [];
      for (let p = 1; p <= 10; p++) {
        const r = await sb('/auth/v1/admin/users?page=' + p + '&per_page=200');
        const a = (r && r.users) || [];
        users.push(...a);
        if (a.length < 200) break;
      }
      const prof = await sb('/rest/v1/profiles?select=id,role,full_name');
      const pm = {};
      prof.forEach(p => { pm[p.id] = p; });
      return res.json({
        users: users.map(u => ({
          id: u.id, email: u.email,
          name: (pm[u.id] && pm[u.id].full_name) || (u.user_metadata && u.user_metadata.full_name) || '',
          role: pm[u.id] ? pm[u.id].role : null,
          off: !!(u.banned_until && new Date(u.banned_until) > new Date()),
          last: u.last_sign_in_at, created: u.created_at
        }))
      });
    }

    if (b.action === 'audit') {
      return res.json({ rows: await sb('/rest/v1/audit_log?select=action,target,detail,actor_name,created_at&order=created_at.desc&limit=30') });
    }

    if (b.action === 'create') {
      const name = String(b.name || '').trim().slice(0, 80), email = String(b.email || '').trim().toLowerCase(), password = String(b.password || '');
      if (!name) throw new Error('Enter the full name.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email.');
      if (!ROLES.includes(b.role)) throw new Error('Choose a role.');
      if (password.length < 8) throw new Error('The password needs at least 8 characters.');
      const u = await sb('/auth/v1/admin/users', 'POST', { email, password, email_confirm: true, user_metadata: { full_name: name } });
      try {
        await sb('/rest/v1/profiles', 'POST', { id: u.id, role: b.role, full_name: name }, { Prefer: 'resolution=merge-duplicates,return=minimal' });
      } catch (e) {
        await sb('/auth/v1/admin/users/' + u.id, 'DELETE').catch(() => {});
        throw e;
      }
      await log('Created account', email, b.role);
      return res.json({ ok: true, id: u.id });
    }

    if (b.action === 'update') {
      needId();
      const patch = {};
      if (typeof b.name === 'string' && b.name.trim()) patch.full_name = b.name.trim().slice(0, 80);
      if (b.role) {
        if (!ROLES.includes(b.role)) throw new Error('Choose a role.');
        if (b.id === me.id) throw new Error('You cannot change your own role.');
        const cur = (await sb('/rest/v1/profiles?id=eq.' + b.id + '&select=role'))[0];
        if (cur && cur.role === 'sysadmin' && b.role !== 'sysadmin' && (await admins()) < 2) throw new Error('There must be at least one System Administrator.');
        patch.role = b.role;
      }
      if (Object.keys(patch).length) await sb('/rest/v1/profiles?id=eq.' + b.id, 'PATCH', patch, { Prefer: 'return=minimal' });
      if (typeof b.off === 'boolean') {
        if (b.id === me.id) throw new Error('You cannot disable your own account.');
        await sb('/auth/v1/admin/users/' + b.id, 'PUT', { ban_duration: b.off ? '876000h' : 'none' });
        await log(b.off ? 'Disabled account' : 'Enabled account', b.email);
      }
      if (Object.keys(patch).length) await log('Updated account', b.email, Object.keys(patch).join(', '));
      return res.json({ ok: true });
    }

    if (b.action === 'reset') {
      needId();
      if (String(b.password || '').length < 8) throw new Error('The password needs at least 8 characters.');
      await sb('/auth/v1/admin/users/' + b.id, 'PUT', { password: b.password });
      await log('Reset password', b.email);
      return res.json({ ok: true });
    }

    if (b.action === 'delete') {
      needId();
      if (b.id === me.id) throw new Error('You cannot delete your own account.');
      const cur = (await sb('/rest/v1/profiles?id=eq.' + b.id + '&select=role'))[0];
      if (cur && cur.role === 'sysadmin' && (await admins()) < 2) throw new Error('There must be at least one System Administrator.');
      await sb('/rest/v1/app_state?user_id=eq.' + b.id, 'DELETE', null, { Prefer: 'return=minimal' }).catch(() => {});
      await sb('/rest/v1/profiles?id=eq.' + b.id, 'DELETE', null, { Prefer: 'return=minimal' }).catch(() => {});
      await sb('/auth/v1/admin/users/' + b.id, 'DELETE');
      await log('Deleted account', b.email);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Something went wrong.' });
  }
};
