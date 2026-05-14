"""
hunter_api.py — Helper to ping the Hunter.io Email Finder API.
"""
import urllib.request
import urllib.parse
import json

def find_email(first_name: str, last_name: str, company: str, api_key: str) -> dict:
    """
    Calls Hunter.io Email Finder API.
    Returns a dict with {"email": "...", "score": 95} or None if not found.
    """
    if not api_key:
        raise ValueError("Hunter API key is missing.")

    base_url = "https://api.hunter.io/v2/email-finder"
    params = {
        "first_name": first_name,
        "last_name": last_name,
        "company": company,
        "api_key": api_key
    }
    
    query_string = urllib.parse.urlencode(params)
    url = f"{base_url}?{query_string}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "NetworkIQ/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            if data and "data" in data and data["data"].get("email"):
                return {
                    "email": data["data"]["email"],
                    "score": data["data"].get("score", 0)
                }
    except urllib.error.HTTPError as e:
        if e.code == 404:
            # Email not found
            return None
        print(f"[hunter_api] HTTP Error: {e.code} - {e.reason}")
    except Exception as e:
        print(f"[hunter_api] Error: {e}")
        
    return None
