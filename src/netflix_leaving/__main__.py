import argparse
import logging
import sys
from pathlib import Path

from .client import fetch_titles
from .config import Settings
from .storage import save_snapshot


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
log = logging.getLogger("netflix-leaving")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch Netflix expiring titles and store snapshots.")
    parser.add_argument(
        "--output",
        default="data",
        help="Base directory for JSON output (default: data)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        settings = Settings.from_env()
        payload = fetch_titles(settings)
        dated_path, latest_path, changed = save_snapshot(payload, Path(args.output))
        log.info("Snapshot written: %s", dated_path)
        log.info("Latest pointer: %s", latest_path)
        if not changed:
            log.info("No changes detected; files left untouched.")
        return 0
    except Exception as exc:  # pragma: no cover - CLI guardrail
        log.error("Failed to fetch or persist data: %s", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())

