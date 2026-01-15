import json
from datetime import datetime
from pathlib import Path
import os

exportlist_jsn = "mylist-export.json"
exportlist_leaving = "mylist-leaving.json"
exportlist_html = "mylist-leaving.html"
latest_data = Path("..") / "data" / "latest.json"
fallback_today = Path("..") / datetime.utcnow().strftime("%Y/%m/%Y%m%d.json")


def get_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def make_webpage(json_path: str):
    pre = post = ""
    with open(os.path.join("include", "body-pre"), encoding="utf-8") as fp:
        pre = fp.read()
    with open(os.path.join("include", "body-post"), encoding="utf-8") as fp:
        post = fp.read()
    return pre + "\t$.getJSON('" + json_path + "', function(data) {\n" + post


def normalize_imdb(item):
    return item.get("imdbid") or item.get("imdb_id")


def select_data_source():
    if latest_data.exists():
        return latest_data
    if fallback_today.exists():
        return fallback_today
    raise FileNotFoundError("No netflix data found (expected data/latest.json).")


ntflx_list = get_json(select_data_source())
mylist = get_json(Path(exportlist_jsn))

print(f"Today JSON entries: {len(ntflx_list.get('results', []))}")
print(f"My List JSON entries: {len(mylist)}")

matches = []
for vod in ntflx_list.get("results", []):
    for check in mylist:
        if normalize_imdb(vod) == normalize_imdb(check):
            print(f"Found {vod.get('title')} (Netflix ID {vod.get('netflix_id')})")
            matches.append(
                {
                    "title": vod.get("title"),
                    "type": vod.get("title_type") or vod.get("type"),
                    "imdbid": normalize_imdb(vod),
                    "runtime": vod.get("runtime", 0),
                    "released": vod.get("year"),
                    "unogsdate": vod.get("unogsdate") or vod.get("title_date"),
                    "image": vod.get("img") or vod.get("poster"),
                }
            )

if matches:
    with open(exportlist_leaving, "w", encoding="utf-8") as outfile:
        json.dump(matches, outfile)
    html = make_webpage(exportlist_leaving)
    with open(exportlist_html, "w", encoding="utf-8") as fp:
        fp.write(html)
else:
    print("No titles from your list are leaving Netflix")
    try:
        env_file = os.getenv("GITHUB_ENV")
        if env_file:
            with open(env_file, "a", encoding="utf-8") as ghenv:
                ghenv.write("Expiring=None")
    except Exception:
        print("An exception occurred, probably executed not on GitHub.")
