import json, os, requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
DETAIL_URL = "https://carburanti.mise.gov.it/ospzApi/registry/servicearea"

def main():
    detail_cache = {}

    for fname in os.listdir(DATA_DIR):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(DATA_DIR, fname)
        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        changed = 0
        for snapshot in data:
            for station in snapshot.get("stations", []):
                sid = str(station["id"])
                if sid in detail_cache:
                    detail = detail_cache[sid]
                else:
                    try:
                        resp = requests.get(f"{DETAIL_URL}/{sid}", timeout=15)
                        if resp.status_code == 200:
                            detail = resp.json()
                            detail_cache[sid] = detail
                        else:
                            detail = None
                    except Exception:
                        detail = None

                if detail is None:
                    continue

                any_change = False
                if not station.get("address") and detail.get("address"):
                    station["address"] = detail["address"]
                    any_change = True
                if not station.get("phoneNumber") and detail.get("phoneNumber"):
                    station["phoneNumber"] = detail["phoneNumber"]
                    any_change = True
                if not station.get("email") and detail.get("email"):
                    station["email"] = detail["email"]
                    any_change = True
                if not station.get("company") and detail.get("company"):
                    station["company"] = detail["company"]
                    any_change = True
                if not station.get("website") and detail.get("website"):
                    station["website"] = detail["website"]
                    any_change = True
                if not station.get("services") and detail.get("services"):
                    station["services"] = [{"id": s["id"], "description": s["description"]} for s in detail["services"]]
                    any_change = True
                if not station.get("openingHours") and detail.get("orariapertura"):
                    station["openingHours"] = detail["orariapertura"]
                    any_change = True

                if any_change:
                    changed += 1

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"{path}: updated {changed} stations")
        else:
            print(f"{path}: no changes")

if __name__ == "__main__":
    main()
