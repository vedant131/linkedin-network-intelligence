"""Smart tagging — runs after classification to add semantic tags."""
import pandas as pd
from config import settings


def _get_tags(row: pd.Series) -> list[str]:
    tags: list[str] = []
    cat = row.get("category", "")
    seniority = row.get("seniority", "")
    company_lower = row.get("company_clean", "").lower()

    # Tag: Hiring Potential
    if cat == "Recruiter/HR" or "talent" in row.get("position_clean", "").lower():
        tags.append("Hiring Potential")

    # Tag: Tech
    if cat in ("Software Engineer", "Data Scientist") or row.get("domain", "") in (
        "AI/ML", "Backend", "Frontend", "Full Stack", "DevOps/Cloud", "Data Engineering"
    ):
        tags.append("Tech")

    # Tag: Business
    if cat in ("Founder/Entrepreneur", "Marketing/Sales") or seniority in ("Lead", "Executive"):
        tags.append("Business")

    # Tag: High Value Connection
    is_high_seniority = seniority in ("Senior", "Lead", "Executive")
    is_tier1 = company_lower in settings.TIER_1_COMPANIES
    is_tier2 = company_lower in settings.TIER_2_COMPANIES

    if settings.company_tier_scoring:
        if is_tier1 or (is_high_seniority and is_tier2):
            tags.append("High Value Connection")
    else:
        if is_high_seniority:
            tags.append("High Value Connection")

    # Tag: Startup
    if cat == "Founder/Entrepreneur":
        tags.append("Startup")

    # Tag: Academia
    if cat == "Student" or "professor" in row.get("position_clean", "").lower():
        tags.append("Academia")

    return list(dict.fromkeys(tags))  # preserve order, remove dupes


def tag_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Add a 'tags' column (list of strings) to the dataframe."""
    df = df.copy()
    df["tags"] = df.apply(_get_tags, axis=1)
    return df
