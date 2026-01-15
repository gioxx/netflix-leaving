import logging
from datetime import datetime
from typing import Any, Dict, Optional, List

import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

from .config import Settings


log = logging.getLogger(__name__)


def _build_session() -> requests.Session:
    retry = Retry(
        total=3,
        backoff_factor=1.0,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
    )
    adapter = HTTPAdapter(max_retries=retry)
    session = requests.Session()
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def _fetch_boxart(netflix_id: int, settings: Settings, session: requests.Session) -> Optional[str]:
    """Fetch first available boxart image for a netflix id."""
    url = f"https://{settings.api_host}/images"
    params = {"netflixid": netflix_id, "limit": 1, "offset": 0}
    headers = {
        "X-RapidAPI-Host": settings.api_host,
        "X-RapidAPI-Key": settings.api_key,
    }
    try:
        resp = session.get(url, headers=headers, params=params, timeout=10)
        if resp.status_code != 200:
            log.warning("Image fetch failed for %s: %s %s", netflix_id, resp.status_code, resp.text[:120])
            return None
        data = resp.json()
        images = data.get("results") or []
        if images:
            return images[0].get("url")
    except Exception as exc:  # pragma: no cover - network path
        log.warning("Image fetch exception for %s: %s", netflix_id, exc)
    return None


def _fetch_detail(netflix_id: int, settings: Settings, session: requests.Session) -> Dict[str, Any]:
    """Fetch detailed metadata for a netflix title."""
    url = f"https://{settings.api_host}/title"
    params = {"netflixid": netflix_id}
    headers = {
        "X-RapidAPI-Host": settings.api_host,
        "X-RapidAPI-Key": settings.api_key,
    }
    try:
        resp = session.get(url, headers=headers, params=params, timeout=12)
        if resp.status_code != 200:
            log.warning("Detail fetch failed for %s: %s %s", netflix_id, resp.status_code, resp.text[:120])
            return {}
        data = resp.json()
        results = data.get("results") or []
        return results[0] if results else {}
    except Exception as exc:  # pragma: no cover - network path
        log.warning("Detail fetch exception for %s: %s", netflix_id, exc)
        return {}


def _decorate_results(results: List[Dict[str, Any]], country: str, settings: Settings, session: requests.Session) -> List[Dict[str, Any]]:
    """Attach contextual fields we expect downstream and enrich with detail calls (bounded)."""
    enriched = []
    dedup: Dict[int, Dict[str, Any]] = {}
    detail_budget = max(0, settings.max_detail_requests)

    for item in results:
        netflix_id = item.get("netflixid")
        if netflix_id is None:
            continue
        entry = dedup.setdefault(
            int(netflix_id),
            {
                "netflixid": int(netflix_id),
                "title": item.get("title") or "Unknown title",
                "title_type": item.get("type", "unknown"),
                "expiredate": item.get("expiredate"),
                "countrycodes": set(),
            },
        )
        current_expire = entry.get("expiredate")
        candidate_expire = item.get("expiredate")
        if current_expire and candidate_expire:
            entry["expiredate"] = min(current_expire, candidate_expire)
        else:
            entry["expiredate"] = current_expire or candidate_expire
        entry["countrycodes"].add(item.get("countrycode") or country)

    for entry in dedup.values():
        detail = {}
        if detail_budget > 0:
            detail = _fetch_detail(entry["netflixid"], settings, session)
            detail_budget -= 1

        if detail:
            entry.setdefault("title_type", detail.get("vtype") or detail.get("title_type") or "unknown")
            entry["synopsis"] = detail.get("synopsis") or detail.get("imdbplot")
            entry["rating"] = detail.get("imdbrating") or detail.get("avgrating")
            entry["imdbid"] = detail.get("imdbid")
            runtime_val = detail.get("netflixruntime") or detail.get("imdbruntime")
            if isinstance(runtime_val, (int, float)):
                entry["runtime"] = int(round(runtime_val / 60))
            else:
                entry["runtime"] = runtime_val
            entry["year"] = detail.get("year")
            entry["poster"] = detail.get("imdbposter") or detail.get("lgimg")
            entry["img"] = detail.get("img") or detail.get("lgimg")
            entry["genre"] = detail.get("imdbgenre")

        entry["countrycodes"] = sorted(code for code in entry["countrycodes"] if code)
        enriched.append(entry)

    return enriched


def fetch_titles(settings: Settings, session: Optional[requests.Session] = None) -> Dict[str, Any]:
    """Fetch expiring titles from uNoGS (NG endpoint)."""
    session = session or _build_session()
    url = f"https://{settings.api_host}/expiring"
    headers = {
        "X-RapidAPI-Host": settings.api_host,
        "X-RapidAPI-Key": settings.api_key,
    }
    params = {
        "countrylist": settings.country,
    }

    log.info("Requesting expiring titles from %s for country %s", url, settings.country)
    response = session.get(url, headers=headers, params=params, timeout=20)
    if response.status_code != 200:
        raise RuntimeError(f"uNoGS request failed: {response.status_code} {response.text}")

    payload = response.json()
    # Basic shape check
    if "results" not in payload or not isinstance(payload["results"], list):
        raise RuntimeError("Unexpected response shape from uNoGS (missing results list).")

    enriched = _decorate_results(payload["results"], settings.country, settings, session)
    return {
        "results": enriched,
        "total": payload.get("total", len(enriched)),
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "country": settings.country,
    }
