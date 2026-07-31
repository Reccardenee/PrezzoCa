import type { Snapshot, FuelType } from "./types"

const FUEL_MAP: Record<FuelType, { fuelId: number; isSelf: boolean }> = {
  diesel_self: { fuelId: 2, isSelf: true },
  diesel_servito: { fuelId: 2, isSelf: false },
  gasoline_self: { fuelId: 1, isSelf: true },
  gasoline_servito: { fuelId: 1, isSelf: false },
}

export const FUEL_LABELS: Record<FuelType, string> = {
  diesel_self: "Gasolio Self",
  diesel_servito: "Gasolio Servito",
  gasoline_self: "Benzina Self",
  gasoline_servito: "Benzina Servito",
}

const DATA_URL = import.meta.env.BASE_URL + "data"

async function fetchJSON(path: string): Promise<unknown> {
  const resp = await fetch(path, { cache: "no-store" })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${path}`)
  return resp.json()
}

export async function loadYear(year: number): Promise<Snapshot[]> {
  return (await fetchJSON(`${DATA_URL}/${year}.json`)) as Snapshot[]
}

export async function loadAllYears(): Promise<Snapshot[]> {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= 2020; y--) {
    years.push(y)
  }
  const results = await Promise.allSettled(years.map(loadYear))
  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function getFuelPrice(station: Snapshot["stations"][number], fuelType: FuelType) {
  const config = FUEL_MAP[fuelType]
  return station.fuels.find((f) => f.fuelId === config.fuelId && f.isSelf === config.isSelf)
}

export function stationLabel(station: { name: string; brand: string; id: number }): string {
  const name = station.name?.trim() || ""
  const brand = station.brand?.trim() || ""
  if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
    return `${brand} - ${name}`
  }
  return name
}

/** Get all distinct stations from the latest snapshot with their labels */
export function buildLabels(stations: { name: string; brand: string; id: number }[]): Map<string, string> {
  const seen = new Map<string, { id: number; index: number }[]>()
  for (const st of stations) {
    const key = st.name
    if (!seen.has(key)) seen.set(key, [])
    seen.get(key)!.push({ id: st.id, index: seen.get(key)!.length })
  }
  const labels = new Map<string, string>()
  for (const [, entries] of seen) {
    const isDup = entries.length > 1
    for (const entry of entries) {
      const st = stations.find((s) => s.id === entry.id)!
      let label = stationLabel(st)
      if (isDup) label = `${label} #${entry.index + 1}`
      labels.set(String(entry.id), label)
    }
  }
  return labels
}

