# NetworkIQ 🔗
> **Turn your LinkedIn connections into actionable intelligence.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vedant131.github.io%2Fnetworkiq-0A66C2?style=for-the-badge&logo=github)](https://vedant131.github.io/networkiq/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://linkedin-network-intelligence.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Upload your LinkedIn data export and instantly see your entire professional network classified, ranked, and searchable — with outreach messages, Excel export, and smart filters.

---

## 🌐 Live App

```
https://vedant131.github.io/networkiq/
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 📦 **ZIP / CSV Upload** | Accepts the full LinkedIn data export ZIP or just `Connections.csv` |
| 🤖 **Auto Classification** | Labels every connection as Engineer, Recruiter, Founder, Student, etc. |
| 📊 **Seniority Detection** | Intern → Junior → Mid → Senior → Lead → Executive |
| 🔍 **Instant Search** | Type "recruiters at Google" or "senior ML engineers" — results in milliseconds |
| 🎛️ **Smart Filters** | Filter by Category, Seniority, Company, Domain, Tags — all from real data |
| 🏆 **Connection Scoring** | Every contact gets a score based on profile completeness & network value |
| 🏷️ **Auto Tags** | "High Value Connection", "New Connection", "Tech" etc. auto-applied |
| 📇 **Contact Drawer** | Click any person to see their email, LinkedIn URL, phone, and outreach tip |
| ✉️ **Outreach Messages** | AI-drafted personalised message suggestions per person |
| 📥 **Excel Export** | Download your full ranked network as a colour-coded `.xlsx` file |
| 📈 **Analytics Dashboard** | Visual breakdown of your network by category, seniority, and domain |

---

## 🏗️ Architecture

```
┌─────────────────────────┐        ┌──────────────────────────┐
│  Frontend (React/Vite)  │  HTTP  │  Backend (FastAPI/Python) │
│  GitHub Pages           │◄──────►│  Render.com (Free Tier)  │
│  vedant131.github.io    │        │  onrender.com            │
└─────────────────────────┘        └──────────────────────────┘
         │                                    │
         │ Instant client-side:               │ Server-side:
         │ • Search                           │ • ZIP / CSV parsing
         │ • Filtering                        │ • Data cleaning
         │ • Sorting                          │ • Classification
         │ • UI rendering                     │ • Ranking & tagging
```

### Tech Stack

**Frontend**
- React 18 + Vite
- Vanilla CSS (LinkedIn design system)
- Deployed on GitHub Pages via GitHub Actions

**Backend**
- Python 3.11 + FastAPI + Uvicorn
- Pandas for data processing
- Rule-based NLP classifier (no external AI needed)
- Deployed on Render (free tier)

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.11+

### One-click start (Windows)
```bat
START.bat
```

### Manual start

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Open → `http://localhost:3000`

---

## 📁 Project Structure

```
networkiq/
├── frontend/                   # React app
│   ├── src/
│   │   ├── App.jsx             # Main app + state management
│   │   ├── api.js              # API base URL helper
│   │   ├── queryEngine.js      # Client-side NLP search engine
│   │   ├── components/
│   │   │   ├── UploadZone.jsx  # Drag & drop file upload
│   │   │   ├── NetworkTable.jsx# Connections table with badges
│   │   │   ├── FilterPanel.jsx # Dynamic filter dropdowns
│   │   │   ├── QueryBar.jsx    # Natural language search bar
│   │   │   ├── ContactDrawer.jsx # Side panel with contact info
│   │   │   ├── InsightsDashboard.jsx # Analytics charts
│   │   │   ├── ExportButton.jsx# Excel download button
│   │   │   └── MessageModal.jsx# Outreach message generator
│   │   └── index.css           # LinkedIn design tokens
│   └── vite.config.js
│
├── backend/                    # FastAPI app
│   ├── main.py                 # API routes
│   ├── config.py               # Settings (AI mode, API keys)
│   ├── models/
│   │   └── schemas.py          # Pydantic request models
│   ├── pipeline/
│   │   ├── ingestion.py        # CSV / ZIP file reader
│   │   ├── cleaning.py         # Name & title normalisation
│   │   ├── classifier.py       # Rule-based category classifier
│   │   ├── tagger.py           # Auto-tagging logic
│   │   ├── ranker.py           # Connection scoring
│   │   └── query_engine.py     # NLP query parser
│   ├── exporters/
│   │   └── excel_exporter.py   # .xlsx builder
│   └── requirements.txt
│
├── .github/workflows/
│   └── deploy.yml              # Auto-deploy frontend to GitHub Pages
├── render.yaml                 # Render backend config
├── START.bat                   # Windows one-click launcher
└── .env.example                # Environment variable template
```

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
AI_MODE=offline           # "offline" (rule-based) or "openai" (GPT-4o-mini)
OPENAI_API_KEY=           # Optional — only needed for AI_MODE=openai
OPENAI_MODEL=gpt-4o-mini  # Optional
BATCH_SIZE=20             # Connections per OpenAI batch
```

### GitHub Secrets (for CI/CD)
| Secret | Value |
|---|---|
| `VITE_API_BASE` | `https://linkedin-network-intelligence.onrender.com` |

---

## 📤 How to Get Your LinkedIn Data

1. Go to **LinkedIn → Settings & Privacy**
2. Click **Data Privacy → Get a copy of your data**
3. Select **"Connections"** → Request archive
4. LinkedIn emails you a ZIP file (usually within 10 minutes)
5. Upload the ZIP directly to NetworkIQ ✅

---

## 🔒 Privacy

Your LinkedIn data is processed on a **secure private server** and held in memory only for the duration of your session. It is never stored in a database, never shared, and never used for any purpose other than showing you your results.

---

## 🗺️ Roadmap

- [ ] Move entire pipeline client-side (browser-only, zero backend)
- [ ] Persistent sessions (no re-upload needed)
- [ ] Custom tagging and notes per connection
- [ ] Custom domain (e.g. `networkiq.app`)
- [ ] Dark mode

---

## 👤 Author

**Vedant** — [@vedant131](https://github.com/vedant131)

---

*Built with ❤️ to make LinkedIn actually useful.*
