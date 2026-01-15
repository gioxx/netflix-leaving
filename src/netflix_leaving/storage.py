import hashlib
import json
from datetime import date
from pathlib import Path
from typing import Any, Dict, Tuple


JSON_INDENT = 2


def _stable_hash(data: Dict[str, Any]) -> str:
    sanitized = dict(data)
    sanitized.pop("fetched_at", None)
    serialized = json.dumps(sanitized, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def _write_if_changed(path: Path, data: Dict[str, Any]) -> bool:
    new_hash = _stable_hash(data)
    if path.exists():
        try:
            current_data = json.loads(path.read_text(encoding="utf-8"))
            existing_hash = _stable_hash(current_data)
            if existing_hash == new_hash:
                return False
        except Exception:
            pass

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=JSON_INDENT, ensure_ascii=True)
    return True


def save_snapshot(payload: Dict[str, Any], base_dir: Path = Path("data")) -> Tuple[Path, Path, bool]:
    """Persist the API payload to a dated file and latest.json.

    Returns tuple: (dated_path, latest_path, changed_anything)
    """
    today = date.today()
    datedir = base_dir / f"{today.year:04d}" / f"{today.month:02d}"
    dated_path = datedir / f"{today.year:04d}{today.month:02d}{today.day:02d}.json"
    latest_path = base_dir / "latest.json"

    changed_dated = _write_if_changed(dated_path, payload)
    changed_latest = _write_if_changed(latest_path, payload)

    return dated_path, latest_path, changed_dated or changed_latest
