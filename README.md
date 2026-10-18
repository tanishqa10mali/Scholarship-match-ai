# ScholarshipMatch

React + Vite frontend, Node/Express backend, Google Gemini AI assistant (free tier). **All scholarship records are fictional DEMO DATA.**

## Run locally (Windows, VS Code)
1. Install Node.js LTS from https://nodejs.org
2. Open the folder in VS Code, then open a terminal (Ctrl+`).
3. Backend:
   ```
   cd backend
   npm install
   copy .env.example .env
   ```
   Open `backend\.env` and put your key after `GEMINI_API_KEY=` (never share or commit it).
   ```
   npm start
   ```
4. Open a second terminal:
   ```
   cd frontend
   npm install
   npm run dev
   ```
5. Visit http://localhost:5173. Without a key, everything works except the chat, which shows a friendly message.

## Get a free Gemini API key
Go to https://aistudio.google.com, sign in with a Google account, click "Get API key" > Create API key. No card is needed for the free tier, which has rate limits. Paste it into `backend\.env` after `GEMINI_API_KEY=`. If you see a "model not found" message, open AI Studio, pick a current Flash model name, and set it as `GEMINI_MODEL`.
Note: on Google's free tier, your prompts may be used to improve their products, so never type personal details into the chat.

## Deploy to Vercel (one project: frontend + backend)
1. Create a GitHub account and push this folder to a new repository (`.env` is git-ignored).
2. Sign in at https://vercel.com with GitHub, choose Add New > Project, import the repo. Leave Root Directory as the repo root (settings come from `vercel.json`).
3. Before deploying, open Environment Variables and add: `GEMINI_API_KEY` (your key), `GEMINI_MODEL` (`gemini-2.5-flash`), `FRONTEND_ORIGIN` (your final Vercel URL, e.g. `https://yourapp.vercel.app`; you can add it after the first deploy, then Redeploy).
4. Click Deploy.
5. Verify: open `https://YOUR-URL/api/health` (should show `"success":true`), then use the site and the AI Assistant.
Do not name any of these variables with a `VITE_` prefix; those become public.

## API
GET `/api/health`, `/api/options`, `/api/scholarships`; POST `/api/match`, `/api/chat`.
