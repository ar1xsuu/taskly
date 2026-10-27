# TASKLY: setup and deployment

This folder is the finished app. Everything the app needs at run time is inside it: no fonts or scripts are loaded from the internet.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole app |
| `sw.js`, `manifest.webmanifest`, `icons/` | Lets people install TASKLY and open it offline (PWA) |
| `fonts/`, `vendor/supabase.js` | Fonts and the Supabase client, bundled so the app works offline |
| `api/admin-users.js` | Server function used by the System Administrator page |
| `sql/` | Database setup, run in the order below |
| `logo.png` | Keep your own logo file next to `index.html` (not included here) |

Your existing `api/assistant.js` stays as it is.

## One-time setup (about 20 minutes)

1. **Database.** In Supabase, open SQL Editor and run these files in this order. Each is safe to run again.
   1. `sql/head-setup.sql`
   2. `sql/sysadmin-setup.sql`
   3. `sql/offline-sync.sql`
   4. `sql/security-hardening.sql` (last; it ends with two check queries you can read)
2. **Auth settings.** Supabase > Authentication: turn **off** "Allow new users to sign up" (accounts are created by the System Administrator). Set the minimum password length to 8 or more.
3. **Server secret.** In Vercel > Project > Settings > Environment Variables add `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Project Settings > API > service_role). Never put this key in `index.html`. Keep your existing `GEMINI_API_KEY`.
4. **Deploy.** Upload this whole folder to your Vercel project (static files plus the `api/` folder) and redeploy.
5. **First System Administrator.** If you do not have one yet, create the user in Supabase > Authentication, then in SQL Editor run:
   `insert into public.profiles (id, role, full_name) values ('<user id>', 'sysadmin', 'Your Name');`
   Every other account is created from the System Administrator > Accounts page.

## Check it works (10 minutes)

1. Sign in as System Administrator, create one SHS Head and two teachers. Each gets a temporary password; they must choose their own at first sign-in.
2. Sign in as a teacher, add a class and tap Check in. Sign in as the Head: the teacher shows as Active / Class Started.
3. As the Head, post an announcement and send a reminder. The teacher sees both in the bell.
4. As the System Administrator, disable a teacher. They can no longer sign in.
5. As a teacher, turn the network off, add a task, turn it back on. The top bar shows "Offline. Saved on this device" and then "All changes saved".

## How offline works

- Teachers can keep working with no connection. Every change is saved on the device first and sent when the connection returns.
- If the same account was changed on two devices, the app does not overwrite silently. It asks which version to keep and offers a copy to download.
- SHS Head and System Administrator pages need a connection; offline they show the last data loaded with a notice.
- Signing out on a device removes the local copy once everything has synced. Unsynced changes are kept until they sync.

## Turning it into apps

- **Install now (no store):** open the site in Chrome, Edge or Safari and choose Install / Add to Home Screen. It opens in its own window and works offline.
- **Android and iOS store apps:** wrap this folder with Capacitor (`npx cap add android`, `npx cap add ios`). Before `index.html` loads, set `window.TASKLY_API = 'https://your-site.vercel.app'` so the app reaches your server functions. In Vercel add `ALLOWED_ORIGINS=capacitor://localhost,http://localhost,https://localhost` for `api/admin-users.js`. Add the same CORS lines to `api/assistant.js`.
- **Windows, macOS and Linux:** wrap with Electron or Tauri the same way (same `window.TASKLY_API`, and add your app's origin, for example `app://taskly`, to `ALLOWED_ORIGINS`).
- Supabase and the session already work from a packaged app. Notifications while the app is closed need a push service and are not included yet.

## Before launch

- In `index.html`, search for `TEST_LOGIN`: it no longer exists. There are no sample accounts, sample data or test logins in this version.
- Run the security checks at the end of `sql/security-hardening.sql` and confirm only the policies you expect exist.
- Change the `VERSION` value in `sw.js` whenever you replace fonts, icons or the Supabase client file.

## Keyboard shortcuts (desktop)

`/` search, `n` new, `g` then `1` to `7` go to a page, `t` light or dark, `Ctrl+S` save now, `?` list, `Esc` close.
