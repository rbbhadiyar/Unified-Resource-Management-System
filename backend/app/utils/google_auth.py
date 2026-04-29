import requests

from app.config import GOOGLE_CLIENT_IDS

GOOGLE_TOKENINFO = "https://oauth2.googleapis.com/tokeninfo"


def verify_google_id_token(id_token: str) -> dict:
    response = requests.get(f"{GOOGLE_TOKENINFO}?id_token={id_token}", timeout=10)
    response.raise_for_status()
    data = response.json()
    if data.get("error"):
        raise ValueError(data.get("error_description", "invalid_token"))
    if GOOGLE_CLIENT_IDS:
        aud = data.get("aud") or data.get("azp")
        if aud not in GOOGLE_CLIENT_IDS:
            raise ValueError("invalid_audience")
    return data
