import json
import os
import sys
from datetime import datetime, timezone

import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")

API_URL = "https://carburanti.mise.gov.it/ospzApi/search/zone"
DETAIL_URL = "https://carburanti.mise.gov.it/ospzApi/registry/servicearea"


def load_config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def fetch_prices(config):
    payload = {
        "points": [{"lat": config["lat"], "lng": config["lng"]}],
        "fuelType": config["fuel"],
        "priceOrder": "asc",
        "radius": config["radius"],
    }
    resp = requests.post(API_URL, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def fetch_station_detail(station_id):
    try:
        resp = requests.get(f"{DETAIL_URL}/{station_id}", timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        return None


def build_snapshot(config, raw):
    stations = []
    for item in raw.get("results", []):
        fuels = []
        for f in item.get("fuels", []):
            fuels.append({
                "fuelId": f.get("fuelId"),
                "name": f.get("name"),
                "price": f.get("price"),
                "isSelf": f.get("isSelf"),
            })
        loc = item.get("location") or {}
        sid = item.get("id")

        detail = fetch_station_detail(sid)
        if detail:
            det_fuels = []
            for f in detail.get("fuels", []):
                det_fuels.append({
                    "fuelId": f.get("fuelId"),
                    "name": f.get("name"),
                    "price": f.get("price"),
                    "isSelf": f.get("isSelf"),
                })
            stations.append({
                "id": sid,
                "name": item.get("name"),
                "brand": item.get("brand"),
                "address": detail.get("address") or "",
                "lat": loc.get("lat"),
                "lng": loc.get("lng"),
                "insertDate": item.get("insertDate"),
                "fuels": det_fuels,
                "phoneNumber": detail.get("phoneNumber") or "",
                "email": detail.get("email") or "",
                "company": detail.get("company") or "",
                "website": detail.get("website") or "",
                "services": detail.get("services") or [],
                "openingHours": detail.get("orariapertura") or {},
            })
        else:
            stations.append({
                "id": sid,
                "name": item.get("name"),
                "brand": item.get("brand"),
                "address": item.get("address") or "",
                "lat": loc.get("lat"),
                "lng": loc.get("lng"),
                "insertDate": item.get("insertDate"),
                "fuels": fuels,
            })

    return {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "city": config["city"],
        "radius": config["radius"],
        "stations": stations,
    }


def load_existing():
    path = os.path.join(DATA_DIR, f"{datetime.now(timezone.utc).strftime('%Y')}.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return []


def save_snapshot(existing, snapshot):
    os.makedirs(DATA_DIR, exist_ok=True)
    year = snapshot["timestamp"][:4]
    path = os.path.join(DATA_DIR, f"{year}.json")
    snapshot_date = snapshot["timestamp"][:10]
    for i, s in enumerate(existing):
        if s["timestamp"][:10] == snapshot_date:
            existing[i] = snapshot
            break
    else:
        existing.append(snapshot)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)


def main():
    try:
        config = load_config()
        raw = fetch_prices(config)
        snapshot = build_snapshot(config, raw)
        existing = load_existing()
        save_snapshot(existing, snapshot)
        print(f"OK \u2014 {snapshot['timestamp']} \u2014 {len(snapshot['stations'])} stazioni")
    except Exception as e:
        print(f"ERRORE \u2014 {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()