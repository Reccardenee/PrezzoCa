import { useState, useMemo } from "react"
import type { Snapshot, FuelType, Station } from "../types"
import { getFuelPrice, FUEL_LABELS } from "../api"
import { COLORS } from "../theme"

interface Props {
  snapshots: Snapshot[]
  onStationDetail: (st: Station) => void
  onScrollToTable: () => void
}

const FUELS: FuelType[] = ["diesel_self", "gasoline_self"]

export default function KpiCards({ snapshots, onStationDetail, onScrollToTable }: Props) {
  return (
    <div className="space-y-6 mb-6">
      {snapshots.length > 0 ? (
        <>
          <SnapshotDate timestamp={snapshots[snapshots.length - 1].timestamp} />
          {FUELS.map((f) => (
            <FuelKpiRow key={f} snapshots={snapshots} fuel={f} label={FUEL_LABELS[f]} onStationDetail={onStationDetail} onScrollToTable={onScrollToTable} />
          ))}
        </>
      ) : null}
    </div>
  )
}

function SnapshotDate({ timestamp }: { timestamp: string }) {
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">
      Ultimo aggiornamento: {new Date(timestamp).toLocaleDateString("it", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
    </div>
  )
}

function FuelKpiRow({ snapshots, fuel, label, onStationDetail, onScrollToTable }: {
  snapshots: Snapshot[]; fuel: FuelType; label: string; onStationDetail: (st: Station) => void; onScrollToTable: () => void
}) {
  const [cheapestIdx, setCheapestIdx] = useState(0)
  const [maxIdx, setMaxIdx] = useState(0)
  const [minIdx, setMinIdx] = useState(0)

  const allPrices = useMemo(() =>
    snapshots.flatMap((s) =>
      s.stations
        .map((st) => getFuelPrice(st, fuel)?.price)
        .filter((p): p is number => p !== undefined)
    ), [snapshots, fuel])

  const min = allPrices.length > 0 ? Math.min(...allPrices) : 0
  const max = allPrices.length > 0 ? Math.max(...allPrices) : 0

  const minStations = useMemo(() => {
    if (snapshots.length === 0) return []
    const result: { station: Station; price: number }[] = []
    const seen = new Set<number>()
    for (const s of snapshots) {
      for (const st of s.stations) {
        const price = getFuelPrice(st, fuel)?.price
        if (price !== undefined && price === min && !seen.has(st.id)) {
          seen.add(st.id)
          result.push({ station: st, price })
        }
      }
    }
    return result
  }, [snapshots, fuel, min])

  if (allPrices.length === 0) return null

  const latest = snapshots[snapshots.length - 1]
  const latestStations = new Map(latest.stations.map((st) => [st.id, st] as const))
  const latestPrices = [...latestStations.values()]
    .map((st) => ({ station: st, price: getFuelPrice(st, fuel)?.price }))
    .filter((x) => x.price !== undefined) as { station: Station; price: number }[]

  if (latestPrices.length === 0) return null

  const avg = allPrices.reduce((a, b) => a + b, 0) / allPrices.length
  const cheapestList = latestPrices.filter((p) => p.price === Math.min(...latestPrices.map((x) => x.price)))
  const mostExpensiveList = latestPrices.filter((p) => p.price === Math.max(...latestPrices.map((x) => x.price)))

  const cheapest = cheapestList[cheapestIdx % cheapestList.length]

  const cycleCheapest = () => {
    const next = (cheapestIdx + 1) % cheapestList.length
    setCheapestIdx(next)
    onStationDetail(cheapestList[next].station)
  }
  const cycleMax = () => {
    const next = (maxIdx + 1) % mostExpensiveList.length
    setMaxIdx(next)
    onStationDetail(mostExpensiveList[next].station)
  }
  const cycleMin = () => {
    if (minStations.length === 0) return
    const next = (minIdx + 1) % minStations.length
    setMinIdx(next)
    onStationDetail(minStations[next].station)
  }

  const accent = fuel === "diesel_self" ? COLORS.primary : COLORS.amber

  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 text-center">{label}</div>
      <div className="flex flex-wrap justify-center gap-4">
        <KpiCard label={cheapestList.length > 1 ? `Distrib. + econ. (1/${cheapestList.length})` : "Distrib. + economico"} value={cheapest.station.label || cheapest.station.name} small accent={accent} onClick={cycleCheapest} clickable />
        <KpiCard label={minStations.length > 1 ? `Minimo (1/${minStations.length})` : "Minimo"} value={`${min.toFixed(3)} \u20AC/L`} accent={accent} onClick={cycleMin} clickable />
        <KpiCard label={mostExpensiveList.length > 1 ? `Massimo (1/${mostExpensiveList.length})` : "Massimo"} value={`${max.toFixed(3)} \u20AC/L`} accent={COLORS.red} onClick={cycleMax} clickable />
        <KpiCard label="Medio" value={`${avg.toFixed(3)} \u20AC/L`} accent={accent} />
        <KpiCard label="Distributori" value={`${latestPrices.length}`} accent={COLORS.violet} onClick={onScrollToTable} clickable />
      </div>
    </div>
  )
}

function KpiCard({ label, value, small, accent, onClick, clickable }: { label: string; value: string; small?: boolean; accent: string; onClick?: () => void; clickable?: boolean }) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center min-w-[140px] flex-1 max-w-[200px] ${clickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`} style={{ borderTopColor: accent, borderTopWidth: 3 }}>
      <div className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-semibold text-gray-900 dark:text-white ${small ? "text-sm truncate" : "text-lg"}`}>{value}</div>
    </Tag>
  )
}
