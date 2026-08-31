# CVAdapt AI — Target-Driven Resume Tailoring

A modern Next.js application that adapts and tailors your resume for specific job descriptions and target roles using Gemini AI with fallback local rule-based optimization.

---

## ✨ Features

- 🎯 **Role-Based Adaptation**: Tailor summary, skill prioritization, and project/responsibility bullets to match roles like Full Stack Developer, Project/Product Manager, UI/UX Designer, Software Tester/QA, or custom roles.
- ⚡ **AI & Offline Modes**: Uses Google Gemini API when configured; automatically falls back to intelligent local keyword-matching if offline or without an API key.
- 📄 **Single-Page A4 ATS-Friendly Preview**: Live interactive resume preview formatted strictly to A4 standard dimensions with print-ready CSS.
- 🖨️ **PDF Export & Clipboard Copy**: One-click browser PDF export (with clean print stylesheets hiding UI) and plain-text copy for job portals.
- 🔄 **Customizable Section Ordering**: Reorder sections (Summary, Skills, Projects, Positions, Certifications) and toggle project visibility on the fly.

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional for AI mode)
Copy the example environment file:
```bash
cp .env.example .env.local
```
Then add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> *Note:* If no API key is provided, the application automatically uses built-in rule-based tailoring.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add `GEMINI_API_KEY` (optional).
4. Click **Deploy**.

### Deploy to Netlify
1. Connect your repository to [Netlify](https://netlify.com).
2. The project includes `netlify.toml` preconfigured for `@netlify/plugin-nextjs`.
3. Set your environment variables in Netlify site settings.
4. Deploy!

---

## 🛠️ Build & Typecheck Commands
- `npm run build` — Build production bundle
- `npm run start` — Run production server
- `npm run typecheck` — Run TypeScript type checking
- `npm run lint` — Lint code
