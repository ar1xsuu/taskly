// TASKLY AI Assistant (Vercel serverless function). The Gemini key lives only in the GEMINI_API_KEY environment variable.
const SB_URL = process.env.SUPABASE_URL || 'https://hqmbboqecfmcviqsfutv.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxbWJib3FlY2ZtY3ZpcXNmdXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDc3MDIsImV4cCI6MjEwNjg4MzcwMn0.YdyWcherKRlFOzrXTQlj6GMYNwsTLWyUn13w56fbtoA';
const MODELS = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.5-flash-lite'].filter(Boolean);
const BASE = 'You are TASKLY Assistant, a teaching helper for Senior High School teachers (Grades 11 and 12). Write clear, practical, classroom-ready material. Use short headings, bullet lists and numbered steps. Do not use tables. Never ask for or include student names or personal details. Never grade or score individual students; if asked, explain that grading is the teacher\'s decision and offer a rubric or answer key instead. Keep answers under about 600 words unless the teacher asks for more. If a request is unrelated to teaching, politely steer back to teaching tasks.';
const MODES = {
  lesson: 'Create a lesson plan with: objectives, materials, a timed sequence (hook, discussion, activity, assessment, wrap-up), differentiation tips, and an exit question.',
  activity: 'Suggest 4 to 5 classroom activities, each with a title, setup steps, time needed, and what students produce. Match the class size and time given.',
  quiz: 'Write the quiz questions requested, then an answer key with brief explanations. Match the difficulty and question type.',
  rubric: 'Create a scoring rubric for the assignment. List 4 to 5 criteria; for each give four performance levels (4 to 1) with short descriptors. Use lists, not tables.',
  simplify: 'Rewrite the text in plain, friendly language at the reading level requested, keeping every instruction. Then add a short version students can read in 20 seconds.',
  chat: 'Answer the teacher\'s question helpfully and concisely.'
};
const hits = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'The AI key is not set up. Add GEMINI_API_KEY in Vercel, then redeploy.' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sign in with a school account to use the assistant.' });
  let user;
  try {
    const r = await fetch(SB_URL + '/auth/v1/user', { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error('bad token');
    user = await r.json();
  } catch (e) { return res.status(401).json({ error: 'Your session expired. Sign in again.' }); }

  const now = Date.now(), recent = (hits.get(user.id) || []).filter(t => now - t < 600000);
  if (recent.length >= 20) return res.status(429).json({ error: 'You have used 20 requests in 10 minutes. Try again shortly.' });
  recent.push(now); hits.set(user.id, recent);

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const { mode, input, history } = body || {};
  if (!MODES[mode] || typeof input !== 'string' || !input.trim() || input.length > 4000) return res.status(400).json({ error: 'Please enter a request (up to 4000 characters).' });
  const hist = (Array.isArray(history) ? history : []).slice(-8)
    .filter(h => h && (h.role === 'user' || h.role === 'model') && typeof h.text === 'string')
    .map(h => ({ role: h.role, parts: [{ text: h.text.slice(0, 4000) }] }));
  const all = input + ' ' + hist.map(h => h.parts[0].text).join(' ');
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(all) || /(\+?63|\b0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|\b\d{10,}\b/.test(all)) {
    return res.status(400).json({ error: 'Remove emails or phone numbers. Do not share personal details with the AI.' });
  }
  const payload = {
    systemInstruction: { parts: [{ text: BASE + ' ' + MODES[mode] }] },
    contents: [...hist, { role: 'user', parts: [{ text: input }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
  };
  let last = 'The AI request failed. Check the function logs in Vercel.';
  for (const m of MODELS) {
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(payload)
      });
      const d = await r.json();
      if (r.ok) {
        const parts = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [];
        const text = parts.map(x => x.text || '').join('').trim();
        if (text) return res.status(200).json({ text, model: m });
        last = 'The AI could not answer that request. Try rewording it.';
        continue;
      }
      if (r.status === 429) last = 'The free AI quota is busy. Try again in a minute.';
      else if (r.status === 401 || r.status === 403) last = 'The AI key was rejected. Check GEMINI_API_KEY in Vercel.';
      console.error('Gemini', m, r.status, JSON.stringify(d).slice(0, 300));
    } catch (e) { console.error(e); }
  }
  return res.status(502).json({ error: last });
};
