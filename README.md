# NetworkIQ 🔗
> **Turn your LinkedIn connections into actionable intelligence, accessible anywhere.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vedant131.github.io%2Fnetworkiq-0A66C2?style=for-the-badge&logo=github)](https://vedant131.github.io/networkiq/)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://linkedin-network-intelligence.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

NetworkIQ transforms your raw LinkedIn data export into a fully searchable, intelligent CRM. Access your professional network on the web dashboard or text the Twilio-powered AI bot directly on WhatsApp to query your network and automatically find missing contact info.

---

## 🌐 Live App

```
https://vedant131.github.io/networkiq/
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **WhatsApp AI Bot** | Text your network from anywhere ("find senior engineers", "who works at Google") |
| 📧 **Hunter.io Enrichment** | Missing an email? Text the bot "get email Raman" or click "Find Email" in the dashboard to instantly find and permanently save their corporate email. |
| 📦 **ZIP / CSV Upload** | Accepts the full LinkedIn data export ZIP or just `Connections.csv` |
| ☁️ **Cloud Database** | All data is securely persisted on Render using a robust SQLite database |
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
│  GitHub Pages           │◄──────►│  Render.com (Production) │
│  vedant131.github.io    │        │  Persistent SQLite /data │
└─────────────────────────┘        └──────────────────────────┘
         │                                    │
         │ Instant client-side:               │ Server-side:
         │ • Smart Search & Filtering         │ • ZIP / CSV parsing & Pipeline
         │ • Dashboard Visualisation          │ • SQLite DB (User Data)
         │ • AI Email Lookup via Hunter.io    │ • NLP Query Engine
         │ • UI rendering                     │ • Twilio Webhook Handler
                                              │ • Auto WhatsApp Bot
```

### Tech Stack

**Frontend**
- React 18 + Vite
- Vanilla CSS (LinkedIn design system)
- Deployed on GitHub Pages via GitHub Actions

**Backend & Bot**
- Python 3.11 + FastAPI + Uvicorn
- Pandas for data processing pipelines
- SQLite (for persistent user databases in Render)
- Twilio SDK for WhatsApp Chatbot
- Hunter.io API for corporate email enrichment
- Deployed on Render

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- Twilio Account (for WhatsApp Bot)
- Hunter.io Account (for Contact Enrichment)

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
```
Copy `.env.example` to `.env` and fill in your Twilio/Hunter keys.
```bash
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

```text
networkiq/
├── frontend/                   # React app
│   ├── src/
│   │   ├── App.jsx             # Main app + state management
│   │   ├── components/         # UI Components (Drawer, Table, Upload)
│   │   └── index.css           # LinkedIn design tokens
│   └── vite.config.js
│
├── backend/                    # FastAPI app
│   ├── main.py                 # API routes & Webhooks
│   ├── db.py                   # SQLite database controller
│   ├── whatsapp_bot.py         # Twilio logic & Intent Parser
│   ├── whatsapp_formatter.py   # TwiML payload builder
│   ├── hunter_api.py           # Contact enrichment via Hunter.io
│   ├── config.py               # Settings (API keys, env logic)
│   ├── pipeline/               # Ingestion, Cleaning, Tagger, NLP
│   └── requirements.txt
│
├── .github/workflows/          # GitHub Actions CI/CD
├── render.yaml                 # Render Infrastructure-as-Code
└── .env.example                # Environment variable template
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Twilio WhatsApp Bot
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WEBSITE_URL=https://vedant131.github.io/networkiq

# Hunter.io Contact Enrichment
HUNTER_API_KEY=your_key_here

# OpenAI (Optional - default is offline rules)
AI_MODE=offline
OPENAI_API_KEY=sk-...
```

---

## 📤 How to Get Your LinkedIn Data

1. Go to **LinkedIn → Settings & Privacy**
2. Click **Data Privacy → Get a copy of your data**
3. Select **"Connections"** → Request archive
4. LinkedIn emails you a ZIP file (usually within 10 minutes)
5. Upload the ZIP directly to NetworkIQ ✅

---

## 🔒 Privacy

Your LinkedIn data is parsed on the server and stored in a private SQLite database keyed securely to your provided E.164 phone number. No third party tracks this data, and it remains accessible only to you through the verified WhatsApp Sandbox.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Vedant** — [@vedant131](https://github.com/vedant131)

*Built with ❤️ to make LinkedIn actually useful.*
