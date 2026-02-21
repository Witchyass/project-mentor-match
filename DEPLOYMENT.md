# MentorMatch — Free Deployment Plan

## Architecture Overview

```
Browser → Static Host (Vercel / Firebase Hosting)
              ↕
        Firebase Auth  +  Firebase Realtime Database
```

This is a **fully client-side SPA** (Vite + React). There is no backend server to deploy — only a static HTML + JS bundle. Firebase handles all auth, data, and real-time updates directly from the browser.

---

## ✅ Recommended: Vercel (easiest, 100% free)

Vercel auto-detects Vite, handles SPA routing, and deploys from GitHub in under 60 seconds.

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/mentor-match.git
git push -u origin main
```

### Step 2 — Import on Vercel
1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. **Add New Project** → select `mentor-match`
3. Vercel auto-detects Vite. Confirm:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy** — live in ~30s

### Step 3 — Fix SPA page refresh (create `public/vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Step 4 — Authorise your domain in Firebase
Firebase Console → **Authentication** → **Settings** → **Authorised domains** → add `your-project.vercel.app`

---

## Alternative: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public directory: dist  |  Single-page app: YES  |  Overwrite index.html: NO

npm run build
firebase deploy
```
Live at `your-project-id.web.app`.

---

## Free Tier Limits

| | Vercel | Firebase Hosting |
|---|---|---|
| Bandwidth | 100 GB/month | 10 GB/month |
| Custom domain + HTTPS | ✅ Free | ✅ Free |
| SPA routing | ✅ via vercel.json | ✅ via firebase.json |

**Firebase Realtime DB (Spark free plan):**
- 1 GB stored data · 10 GB/month download · 100 simultaneous connections

---

## 🔒 Harden DB Rules Before Going Live

Replace the current dev rules in `REALTIME_DATABASE_RULES.json`:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "requests":      { ".read": "auth != null", ".write": "auth != null" },
    "matches":       { ".read": "auth != null", ".write": "auth != null" },
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null"
      }
    },
    "chats":         { ".read": "auth != null", ".write": "auth != null" }
  }
}
```

Deploy rules:
```bash
firebase deploy --only database
```

---

## Launch Checklist

- [ ] Remove dev `console.log` statements
- [ ] Harden Firebase DB rules (above)
- [ ] `git push` to GitHub
- [ ] Import on Vercel
- [ ] Add Vercel domain to Firebase Authorised Domains
- [ ] Test full flow: signup → verify email → onboarding → dashboard
- [ ] 🚀 Ship it
