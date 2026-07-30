import json, os, sys, requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
API_URL = "https://carburanti.mise.gov.it/ospzApi/search/zone"

def fetch_current():
    resp = requests.post(API_URL, json={
        "points": [{"lat": 37.5082, "lng": 13.0810}],
        "fuelType": 2, "priceOrder": "asc", "radius": 5,
    }, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    result = {}
    for item in data.get("results", []):
        loc = item.get("location") or {}
        result[str(item["id"])] = {
            "lat": loc.get("lat"),
            "lng": loc.get("lng"),
            "address": item.get("address") or "",
        }
    return result

def main():
    updates = fetch_current()
    print(f"Fetched {len(updates)} stations with coordinates")

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
                if sid in updates:
                    u = updates[sid]
                    if station.get("lat") is None and u["lat"] is not None:
                        station["lat"] = u["lat"]
                        station["lng"] = u["lng"]
                        changed += 1
                    if not station.get("address") and u["address"]:
                        station["address"] = u["address"]
                        changed += 1

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Updated {path}: {changed} fixes")
        else:
            print(f"{path}: no changes")

if __name__ == "__main__":
    main()
