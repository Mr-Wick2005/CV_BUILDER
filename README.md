# CVAdapt AI — Intelligent ATS Resume Builder & Career Studio

A modern, full-featured Next.js application that adapts, tailors, and styles your resume for target job descriptions using Google Gemini AI, featuring an interactive in-canvas editor, live A4 ATS preview, an AI Career Copilot chat assistant, and seamless offline fallback.

---

## ✨ Features

### 🤖 AI Career Copilot Chat
- **Conversational Resume Assistant**: Chat with an AI assistant that has complete context of your live resume, target role, and job description.
- **Real-Time Canvas Patching**: The copilot can rewrite sections, reorder skills, and apply targeted diffs directly to your live resume with a single click.
- **Quick Action Prompts**:
  - 🎯 **Tailor to JD**: Align resume content, technical keywords, and project bullets to a job description.
  - 🪄 **STAR Bullets**: Transform generic descriptions into high-impact bullets using the Situation, Task, Action, Result framework.
  - ✨ **Executive Summary**: Craft punchy, recruiter-targeted summaries.
  - 🧠 **ATS Keywords Match**: Identify keyword gaps between your profile and the job description.
  - 📑 **Fit to 1 Page**: Calibrate content density to eliminate trailing voids and cleanly fit on a single A4 page.

### 📄 Interactive Live A4 ATS Canvas & In-Place Editing
- **Direct Canvas Editing**: Click and edit text directly on the rendered A4 document canvas with inline typography controls and real-time updates.
- **Dual-Mode Document Preview**:
  - **Original Uploaded Document**: High-fidelity PDF rendering via PDF.js preserving original styling and layout.
  - **Editable ATS Canvas**: Calibrated, ATS-compliant single/multi-page A4 document view.
- **Original PDF Byte Preservation**: Uploaded PDFs are stored in IndexedDB to avoid LocalStorage limits and preserve original binary fidelity.

### 🎯 Target-Driven Role Tailoring
- **Role Presets**: Optimized profiles for Full Stack Developer, Frontend Developer, Backend Developer, QA/Software Tester, DevOps Engineer, Data Analyst, UI/UX Designer, Product Manager, or Custom Roles.
- **Job Description Analysis**: Paste any job description or select built-in JD presets to match skills, responsibilities, and summary.
- **AI & Offline Dual Engine**: Uses Google Gemini API when configured; automatically falls back to an intelligent local NLP keyword-matching and verb-enhancement engine when offline or without an API key.

### 📊 Real-Time ATS Score Card
- **Comprehensive Match Scoring**: 0–100% score evaluating contact info completeness, summary impact, technical skills match, quantifiable experience metrics, and ATS formatting readiness.
- **Actionable Recommendations**: Specific tips to improve keyword density, action verb strength, and layout structure.

### 🎨 Theme, Typography & Design Studio
- **4 Professional ATS Templates**: Modern ATS, Elegant Serif, Tech Minimal, and Executive.
- **5 Typography Choices**: Inter, Merriweather (Serif), Outfit, Roboto, and JetBrains Mono.
- **6 Curated Accent Palettes**: Slate, Sapphire, Emerald, Crimson, Royal, and Charcoal.
- **Formatting Controls**: Spacing density (Compact, Normal, Relaxed), bullet styles (`•`, `–`, `▪`, `◦`), and font scaling.

### ✏️ Section Management & Reordering
- Manage all standard sections: Personal/Contact Info, Executive Summary, Categorized Technical Skills, Work Experience, Projects (with live URLs & tech tags), Education, Certifications, and Custom Sections.
- Reorder sections dynamically (drag or arrow controls) and toggle individual project visibility.

### ✉️ AI Cover Letter Generator
- Generate personalized, professional cover letters tailored to your selected role and job description with copy and export functionality.

### 📥 Smart Multi-Format Ingestion
- Ingest resumes from **PDF**, **TXT**, **JSON**, and **Markdown**.
- **Spatial Layout Aware Parser**: PDF.js coordinate extraction detects column layout, contact header groupings, split hyphens, and continuation bullets.
- Fallback AI parsing endpoint for unstructured text.

### 🖨️ Print-Ready Export
- **A4 PDF Export**: One-click browser PDF export with `@media print` rules designed to avoid orphan headers and page-break splits.
- **ATS Plain Text Copy**: Instant one-click copy of plain-text ATS-formatted resume for quick pasting into company application forms.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Edge API Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Print Styles
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/) Icons
- **PDF Engine**: [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`)
- **Storage**: IndexedDB for PDF binaries + LocalStorage for profiles & settings
- **AI Integration**: Google Gemini API (with zero-dependency local rule-based fallback)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** 18.17.0 or higher
- **npm** or **yarn** / **pnpm**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Mr-Wick2005/CV_BUILDER.git
cd CV_BUILDER
npm install
```

### 3. Environment Setup (Optional for AI Mode)
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key in `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: The application works completely offline without an API key using the built-in local rule-based tailoring and NLP enhancement engine.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | Run Next.js ESLint validation |

---

## 🌐 API Routes

- `POST /api/chat` — Conversational AI Copilot endpoint with resume diffing and patch recommendations.
- `POST /api/tailor` — Full resume tailoring against target role and job description.
- `POST /api/enhance-bullet` — AI-powered STAR method single-bullet enhancer.
- `POST /api/generate-cover-letter` — Role- and JD-specific cover letter generation.
- `POST /api/parse-resume` — AI-assisted resume parsing fallback from raw text.

---

## 🚢 Deployment

### Deploy on Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. (Optional) Set the `GEMINI_API_KEY` in Environment Variables.
4. Click **Deploy**.

### Deploy on Netlify
1. Connect your repository to [Netlify](https://netlify.com).
2. The project contains a preconfigured `netlify.toml` for `@netlify/plugin-nextjs`.
3. Set your environment variables in Netlify site settings and deploy.

---

## 📄 License

MIT
