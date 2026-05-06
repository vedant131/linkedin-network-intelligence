"""Ranking engine — scores each connection based on relevance, seniority, and company tier."""
import pandas as pd
from config import settings

SENIORITY_WEIGHTS = {
    "Intern": 0.1,
    "Junior": 0.3,
    "Mid-level": 0.5,
    "Senior": 0.75,
    "Lead": 0.85,
    "Executive": 1.0,
    "Unknown": 0.4,
}

CATEGORY_WEIGHTS = {
    "Software Engineer": 0.8,
    "Data Scientist": 0.85,
    "Founder/Entrepreneur": 0.9,
    "Recruiter/HR": 0.7,
    "Marketing/Sales": 0.65,
    "Student": 0.4,
    "Other": 0.5,
}


def _company_tier_score(company: str) -> float:
    cl = company.lower()
    if cl in settings.TIER_1_COMPANIES:
        return 1.0
    if cl in settings.TIER_2_COMPANIES:
        return 0.6
    return 0.3


def score_row(row: pd.Series, query_keywords: list[str] | None = None) -> float:
    seniority_score = SENIORITY_WEIGHTS.get(row.get("seniority", "Unknown"), 0.4)
    category_score  = CATEGORY_WEIGHTS.get(row.get("category", "Other"), 0.5)
    company_score   = _company_tier_score(row.get("company_clean", "")) if settings.company_tier_scoring else 0.5

    # Keyword relevance (boosted when query matches title/category/domain)
    relevance = 0.0
    if query_keywords:
        text = f"{row.get('position_clean','')} {row.get('category','')} {row.get('domain','')} {row.get('company_clean','')}".lower()
        matches = sum(1 for kw in query_keywords if kw in text)
        relevance = min(matches / max(len(query_keywords), 1), 1.0)

    if query_keywords:
        score = relevance * 0.5 + seniority_score * 0.3 + company_score * 0.2
    else:
        score = category_score * 0.4 + seniority_score * 0.35 + company_score * 0.25

    return round(score, 4)


def rank_dataframe(df: pd.DataFrame, query_keywords: list[str] | None = None) -> pd.DataFrame:
    """Add / update 'score' column and sort descending."""
    df = df.copy()
    df["score"] = df.apply(lambda r: score_row(r, query_keywords), axis=1)
    return df.sort_values("score", ascending=False).reset_index(drop=True)
