import { useState, useMemo } from "react"
import type { Snapshot, FuelType, Station } from "../types"
import { getFuelPrice, FUEL_LABELS } from "../api"
import { COLORS } from "../theme"

interface Props {
  snapshots: Snapshot[]
  onStationDetail: (st: Station) => void
}

export default function KpiCards({ snapshots, onStationDetail }: Props) {
  return (
    <div className="space-y-6 mb-6">
      {snapshots.length > 0 ? (
        <>
          <SnapshotDate timestamp={snapshots[snapshots.length - 1].timestamp} />
          <div className="space-y-6">
            <FuelKpiRow snapshots={snapshots} fuel="diesel_self" label={FUEL_LABELS.diesel_self} onStationDetail={onStationDetail} />
            <FuelKpiRow snapshots={snapshots} fuel="gasoline_self" label={FUEL_LABELS.gasoline_self} onStationDetail={onStationDetail} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function SnapshotDate({ timestamp }: { timestamp: string }) {
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">
      Ultimo aggiornamento: {new Date(timestamp).toLocaleDateString("it", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}, alle {new Date(timestamp).toLocaleTimeString("it", { hour: "2-digit", minute: "2-digit" })}
    </div>
  )
}

function FuelKpiRow({ snapshots, fuel, label, onStationDetail }: {
  snapshots: Snapshot[]; fuel: FuelType; label: string; onStationDetail: (st: Station) => void
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

  const cycleLinked = (id: number) => {
    const ci = cheapestList.findIndex(s => s.station.id === id)
    if (ci !== -1) setCheapestIdx(ci)
    const mi = minStations.findIndex(s => s.station.id === id)
    if (mi !== -1) setMinIdx(mi)
  }

  const prevCheapest = () => {
    const next = (cheapestIdx - 1 + cheapestList.length) % cheapestList.length
    cycleLinked(cheapestList[next].station.id)
  }
  const nextCheapest = () => {
    const next = (cheapestIdx + 1) % cheapestList.length
    cycleLinked(cheapestList[next].station.id)
  }

  const goMax = (idx: number) => setMaxIdx(idx)
  const prevMax = () => goMax((maxIdx - 1 + mostExpensiveList.length) % mostExpensiveList.length)
  const nextMax = () => goMax((maxIdx + 1) % mostExpensiveList.length)

  const prevMin = () => {
    if (minStations.length === 0) return
    const next = (minIdx - 1 + minStations.length) % minStations.length
    cycleLinked(minStations[next].station.id)
  }
  const nextMin = () => {
    if (minStations.length === 0) return
    const next = (minIdx + 1) % minStations.length
    cycleLinked(minStations[next].station.id)
  }

  const accent = fuel === "diesel_self" ? COLORS.primary : COLORS.amber

  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 text-center">{label}</div>
      <div className="flex flex-wrap justify-center gap-4">
        <KpiCard label="Distrib. + economico" value={cheapest.station.label || cheapest.station.name} small accent={accent} onClick={() => onStationDetail(cheapest.station)} count={cheapestList.length} currentIdx={cheapestIdx} onPrev={prevCheapest} onNext={nextCheapest} />
        <KpiCard label="Minimo" value={`${min.toFixed(3)} \u20AC/L`} accent={accent} onClick={() => onStationDetail(minStations[minIdx % minStations.length]?.station)} count={minStations.length} currentIdx={minIdx} onPrev={prevMin} onNext={nextMin} />
        <KpiCard label="Massimo" value={`${max.toFixed(3)} \u20AC/L`} accent={COLORS.red} onClick={() => onStationDetail(mostExpensiveList[maxIdx % mostExpensiveList.length].station)} count={mostExpensiveList.length} currentIdx={maxIdx} onPrev={prevMax} onNext={nextMax} />
        <KpiCard label="Medio" value={`${avg.toFixed(3)} \u20AC/L`} accent={accent} />

      </div>
    </div>
  )
}

function KpiCard({ label, value, small, accent, onClick, count, currentIdx, onPrev, onNext }: {
  label: string; value: string; small?: boolean; accent: string; onClick?: () => void;
  count?: number; currentIdx?: number; onPrev?: () => void; onNext?: () => void
}) {
  const Tag = "button"
  const multi = count && count > 1
  return (
    <Tag onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center min-w-[140px] flex-1 max-w-[200px] ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`} style={{ borderTopColor: accent, borderTopWidth: 3 }}>
      <div className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-semibold text-gray-900 dark:text-white ${small ? "text-sm truncate" : "text-lg"}`}>{value}</div>
      {multi ? (
        <div className="flex items-center justify-center gap-2 mt-1.5 text-gray-500 dark:text-gray-400">
          <button onClick={(e) => { e.stopPropagation(); onPrev?.() }} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-xl px-1 leading-none">&larr;</button>
          <span className="tabular-nums text-xs">{currentIdx! + 1}/{count}</span>
          <button onClick={(e) => { e.stopPropagation(); onNext?.() }} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-xl px-1 leading-none">&rarr;</button>
        </div>
      ) : null}
    </Tag>
  )
}
