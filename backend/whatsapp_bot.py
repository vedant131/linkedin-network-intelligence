"""
whatsapp_bot.py — Core bot logic for NetworkIQ WhatsApp integration.

Receives a parsed incoming message dict and returns a TwiML XML response string.
All user data is loaded from SQLite by phone number.
"""
import json
from collections import Counter

from db import (
    user_exists, load_user_data, get_user_info,
    delete_user_data, get_user_state, set_user_state,
)
from pipeline.query_engine import process_query
from whatsapp_formatter import (
    format_results_page, format_stats, format_top_companies,
    format_help, format_not_registered, PAGE_SIZE,
)

WEBSITE_URL = "http://localhost:3000"  # Will be overridden by config


def _twiml(message: str) -> str:
    """Wrap a message in a Twilio TwiML Response."""
    # Escape XML special chars
    safe = (
        message
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f"<Response><Message>{safe}</Message></Response>"
    )


def _compute_summary(df) -> dict:
    """Compute lightweight stats from a DataFrame."""
    from collections import Counter
    by_cat = df["category"].value_counts().to_dict() if "category" in df.columns else {}
    top_cos = [
        [k, v] for k, v in
        df["company_clean"].value_counts().head(15).items()
    ] if "company_clean" in df.columns else []
    return {"by_category": by_cat, "top_companies": top_cos}


def handle_message(from_phone: str, body: str, website_url: str = WEBSITE_URL) -> str:
    """
    Main entry point. Takes the sender's phone and message text.
    Returns a TwiML XML string.
    """
    text = body.strip() if body else ""
    text_lower = text.lower().strip()

    # ── Handle "more" (pagination) ─────────────────────────────────────────────
    if text_lower == "more":
        state = get_user_state(from_phone)
        if not state.get("result_json"):
            return _twiml("No previous results to continue. Try a new query!")

        results = json.loads(state["result_json"])
        page = state.get("page", 0) + 1
        label = state.get("last_query", "")
        total = len(results)

        if page * PAGE_SIZE >= total:
            set_user_state(from_phone, page=0)
            return _twiml("✅ You've seen all results!\n\nAsk a new question to search again.")

        reply = format_results_page(results, page, total, label)
        set_user_state(from_phone, last_query=label, page=page,
                       result_json=state["result_json"])
        return _twiml(reply)

    # ── Reset command ──────────────────────────────────────────────────────────
    if text_lower in ("reset", "delete", "clear"):
        delete_user_data(from_phone)
        return _twiml(
            "🗑️ *Data cleared.*\n\n"
            f"Visit {website_url} to upload new LinkedIn connections."
        )

    # ── Help command ──────────────────────────────────────────────────────────
    if text_lower in ("help", "hi", "hello", "hey", "start", "commands", "?"):
        if not user_exists(from_phone):
            return _twiml(format_not_registered(website_url))
        return _twiml(format_help())

    # ── Check registration ─────────────────────────────────────────────────────
    if not user_exists(from_phone):
        return _twiml(format_not_registered(website_url))

    # ── Stats command ──────────────────────────────────────────────────────────
    if text_lower in ("stats", "statistics", "summary", "overview"):
        info = get_user_info(from_phone)
        df = load_user_data(from_phone)
        if df is None:
            return _twiml("⚠️ Could not load your data. Please re-upload via the website.")
        summary = _compute_summary(df)
        return _twiml(format_stats(info, summary))

    # ── Top companies command ──────────────────────────────────────────────────
    if text_lower in ("top companies", "companies", "top", "top company"):
        df = load_user_data(from_phone)
        if df is None:
            return _twiml("⚠️ Could not load your data.")
        if "company_clean" in df.columns:
            top_cos = [
                [k, v] for k, v in
                df["company_clean"].value_counts().head(15).items()
            ]
        else:
            top_cos = []
        return _twiml(format_top_companies(top_cos))

    # ── Enrich Contact Command ─────────────────────────────────────────────────
    if text_lower.startswith(("get email ", "get email for ", "find email ", "find email for ", "enrich ")):
        target_name = text_lower
        for prefix in ("get email for ", "find email for ", "get email ", "find email ", "enrich "):
            if target_name.startswith(prefix):
                target_name = target_name[len(prefix):].strip()
                break
                
        df = load_user_data(from_phone)
        if df is None:
            return _twiml("⚠️ Could not load your data.")
            
        # Find connection by name
        if 'FullName' in df.columns:
            matches = df[df['FullName'].str.lower().str.contains(target_name.lower(), na=False)]
        else:
            return _twiml("⚠️ Missing name column in database. Please re-upload.")
            
        if matches.empty:
            return _twiml(f"❌ Couldn't find anyone named '{target_name}' in your connections.")
            
        row = matches.iloc[0]
        full_name = str(row.get('FullName', row.get('full_name', '')))
        company = str(row.get('Company', row.get('company_clean', '')))
        existing_email = str(row.get('Email Address', row.get('email', '')))
        
        if existing_email and existing_email.strip() and existing_email.lower() != "nan":
            return _twiml(f"✅ You already have the email for {full_name}:\n\n📧 {existing_email}")
            
        if not company or company.lower() == "nan":
            return _twiml(f"❌ Cannot find email for {full_name} because they don't have a company listed.")
            
        # Call Hunter API
        import hunter_api
        from config import settings
        
        if not settings.hunter_api_key:
            return _twiml("❌ Enrichment API key is not configured. Please add HUNTER_API_KEY to your environment variables.")
            
        first_name = full_name.split()[0]
        last_name = " ".join(full_name.split()[1:]) if len(full_name.split()) > 1 else ""
        
        result = hunter_api.find_email(first_name, last_name, company, settings.hunter_api_key)
        
        if result:
            email = result["email"]
            score = result["score"]
            # Save it
            from db import update_user_connection_email
            update_user_connection_email(from_phone, full_name, company, email)
            return _twiml(f"✨ Found email for {full_name} at {company}!\n\n📧 {email}\n\n_Confidence: {score}%_")
        else:
            return _twiml(f"❌ Sorry, couldn't find a verified corporate email for {full_name} at {company}.")

    # ── Natural language query ─────────────────────────────────────────────────
    df = load_user_data(from_phone)
    if df is None:
        return _twiml(
            "⚠️ Could not load your data.\n\n"
            f"Please re-upload at {website_url}"
        )

    try:
        results, label = process_query(df, text)
    except Exception as e:
        return _twiml(f"❌ Error processing query: {str(e)[:100]}\n\nTry: 'find recruiters at Google'")

    total = len(results)
    page = 0

    # Save pagination state
    set_user_state(
        from_phone,
        last_query=label,
        page=0,
        result_json=json.dumps(results),
    )

    reply = format_results_page(results, page, total, label)
    return _twiml(reply)
