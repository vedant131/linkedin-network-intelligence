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
