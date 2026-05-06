"""
FastAPI application — LinkedIn Network Intelligence API
"""
import uuid
import json
from collections import Counter
from typing import Optional

import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io

from config import settings
from models.schemas import QueryRequest, MessageRequest, ExportRequest
from pipeline.ingestion import ingest_csv, ingest_zip
from pipeline.cleaning import clean_dataframe
from pipeline.classifier import classify_dataframe
from pipeline.tagger import tag_dataframe
from pipeline.ranker import rank_dataframe
from pipeline.query_engine import process_query
from exporters.excel_exporter import build_excel

app = FastAPI(title="LinkedIn Network Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://vedant131.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory session store ────────────────────────────────────────────────────
_sessions: dict[str, pd.DataFrame] = {}


def _df_to_connections(df: pd.DataFrame) -> list[dict]:
    records = []
    for idx, row in df.iterrows():
        tags = row.get("tags", [])
        if not isinstance(tags, list):
            tags = []
        records.append({
            "id":               int(idx),
            "full_name":        str(row.get("full_name", "")),
            "job_title_raw":    str(row.get("position", "")),
            "job_title_clean":  str(row.get("position_clean", "")),
            "company":          str(row.get("company_clean", row.get("company", ""))),
            "email":            str(row.get("email", "")),
            "linkedin_url":     str(row.get("linkedin_url", "")),
            "account_phone":    str(row.get("account_phone", "")),
            "account_email":    str(row.get("account_email", "")),
            "connected_on":     str(row.get("connected_on", "")),
            "category":         str(row.get("category", "Other")),
            "seniority":        str(row.get("seniority", "Unknown")),
            "domain":           str(row.get("domain", "General")),
            "tags":             tags,
            "score":            float(row.get("score", 0.0)),
        })
    return records


def _compute_insights(df: pd.DataFrame) -> dict:
    by_cat  = df["category"].value_counts().to_dict()
    by_sen  = df["seniority"].value_counts().to_dict()
    by_dom  = df["domain"].value_counts().to_dict()
    top_cos = [[k, v] for k, v in df["company_clean"].value_counts().head(10).items()]

    all_tags = [t for tags in df["tags"] for t in (tags if isinstance(tags, list) else [])]
    tag_counts = Counter(all_tags)

    return {
        "total":                  len(df),
        "by_category":            by_cat,
        "by_seniority":           by_sen,
        "by_domain":              by_dom,
        "top_companies":          top_cos,
        "high_value_count":       tag_counts.get("High Value Connection", 0),
        "hiring_potential_count": tag_counts.get("Hiring Potential", 0),
        "tech_count":             tag_counts.get("Tech", 0),
    }


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "ai_mode": settings.ai_mode, "version": "1.0.0"}


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    """
    Ingest a LinkedIn connections export.
    Accepts:
      - Connections.csv  (plain CSV from the export ZIP)
      - Complete_LinkedInDataExport_*.zip  (the entire LinkedIn ZIP)
    """
    fname   = (file.filename or "").lower()
    is_zip  = fname.endswith(".zip")
    is_csv  = fname.endswith(".csv")

    if not (is_zip or is_csv):
        raise HTTPException(400, "Please upload either the Connections.csv file OR the full LinkedIn data export ZIP.")

    content    = await file.read()
    found_files = {}

    try:
        if is_zip:
            df, found_files = ingest_zip(content)
        else:
            df = ingest_csv(content)

        df = clean_dataframe(df)
        df = classify_dataframe(df)
        df = tag_dataframe(df)
        df = rank_dataframe(df)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except Exception as exc:
        raise HTTPException(500, f"Processing error: {exc}")

    session_id = str(uuid.uuid4())
    _sessions[session_id] = df

    return {
        "session_id":   session_id,
        "connections":  _df_to_connections(df),
        "insights":     _compute_insights(df),
        "total":        len(df),
        "found_files":  found_files,
        "file_type":    "zip" if is_zip else "csv",
    }


@app.post("/api/query")
async def query_network(req: QueryRequest):
    """Natural-language search over a processed network."""
    df = _sessions.get(req.session_id)
    if df is None:
        raise HTTPException(404, "Session not found. Please upload your CSV again.")

    results, label = process_query(df, req.query, req.filters or {})
    return {"results": results, "total": len(results), "interpreted_as": label}


@app.post("/api/export")
async def export_excel(req: ExportRequest):
    """Stream a .xlsx file for the processed network."""
    df = _sessions.get(req.session_id)
    if df is None:
        raise HTTPException(404, "Session not found.")

    xlsx_bytes = build_excel(df)
    return StreamingResponse(
        io.BytesIO(xlsx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=my_network.xlsx"},
    )


@app.post("/api/message")
async def generate_message(req: MessageRequest):
    """Generate an AI-powered outreach message for a specific connection."""
    df = _sessions.get(req.session_id)
    if df is None:
        raise HTTPException(404, "Session not found.")

    try:
        row = df.loc[req.connection_id]
    except KeyError:
        raise HTTPException(404, "Connection not found.")

    name    = row.get("full_name", "there")
    title   = row.get("position_clean", "professional")
    company = row.get("company_clean", "your company")
    purpose = req.purpose

    # Try OpenAI first
    if settings.ai_mode == "openai" and settings.openai_api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.openai_api_key)
            prompt = f"""Write a short, professional LinkedIn connection message (max 120 words).
Sender goal: {purpose}
Recipient: {name}, {title} at {company}
Tone: Warm, genuine, not salesy. Reference their specific role naturally.
Return only the message text. No greeting prefix."""

            res = client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )
            message = res.choices[0].message.content.strip()
            return {"message": message, "mode": "ai"}
        except Exception as e:
            print(f"[message] OpenAI error: {e}")

    # Fallback: template-based messages
    templates = {
        "internship": f"Hi {name.split()[0]}, I came across your profile and was really impressed by your work as {title} at {company}. I'm actively looking for internship opportunities and would love to connect and learn from your journey. Would really appreciate a quick chat if you have time!",
        "job":        f"Hi {name.split()[0]}, your background as {title} at {company} caught my attention. I'm exploring new opportunities in this space and would love to connect with experienced professionals like yourself. Would be great to stay in touch!",
        "networking": f"Hi {name.split()[0]}, I noticed your impressive work as {title} at {company}. I'm always looking to connect with sharp professionals in this space. Would love to add you to my network and perhaps exchange ideas sometime!",
        "collaboration": f"Hi {name.split()[0]}, your role as {title} at {company} aligns closely with something I'm working on. I'd love to connect and explore potential synergies — would be great to have a quick chat if you're open to it!",
    }
    message = templates.get(purpose, templates["networking"])
    return {"message": message, "mode": "template"}


@app.get("/api/insights/{session_id}")
async def get_insights(session_id: str):
    df = _sessions.get(session_id)
    if df is None:
        raise HTTPException(404, "Session not found.")
    return _compute_insights(df)
