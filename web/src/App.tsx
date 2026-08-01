import { useState, useMemo, useEffect } from "react"
import type { FuelType, Station } from "./types"
import { useData } from "./hooks/useData"
import { useTheme } from "./theme"
import { buildLabels } from "./api"
import KpiCards from "./components/KpiCards"
import Filters from "./components/Filters"
import PriceTrendChart from "./components/PriceTrendChart"
import AverageTrendChart from "./components/AverageTrendChart"
import StationMultiLine from "./components/StationMultiLine"
import StationRanking from "./components/StationRanking"
import PriceDistribution from "./components/PriceDistribution"
import StationBoxPlot from "./components/StationBoxPlot"
import PriceHeatmap from "./components/PriceHeatmap"
import StationTimeline from "./components/StationTimeline"
import PriceChangesChart from "./components/PriceChangesChart"
import CityDiffChart from "./components/CityDiffChart"
import StationsTable from "./components/StationsTable"
import StationDetail from "./components/StationDetail"
import FuelSelector from "./components/FuelSelector"

export default function App() {
  const { snapshots, loading, error } = useData()
  const { dark, toggle: toggleDark } = useTheme()
  const [fuel, setFuel] = useState<FuelType>("diesel_self")
  const [station, setStation] = useState("")
  const [brand, setBrand] = useState("")
  const [search, setSearch] = useState("")
  const [detailStation, setDetailStation] = useState<Station | null>(null)
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const brands = useMemo(() => {
    if (snapshots.length === 0) return []
    const latest = snapshots[snapshots.length - 1]
    return [...new Set(latest.stations.map((s) => s.brand).filter(Boolean))].sort()
  }, [snapshots])

  const stations = useMemo(() => {
    if (snapshots.length === 0) return []
    const latest = snapshots[snapshots.length - 1]
    return latest.stations
      .map((s) => ({ id: s.id, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [snapshots])

  const labels = useMemo(() =>
    snapshots.length > 0
      ? buildLabels(snapshots[snapshots.length - 1].stations)
      : new Map<string, string>(),
  [snapshots])

  const filtered = useMemo(() => {
    if (snapshots.length === 0) return []
    return snapshots
      .map((s) => ({
        ...s,
        stations: s.stations
          .filter((st) => {
            if (station && st.name !== station) return false
            if (brand && st.brand !== brand) return false
            if (search && !st.name.toLowerCase().includes(search.toLowerCase())) return false
            return true
          })
          .map((st) => ({ ...st, label: labels.get(String(st.id)) || st.name })),
      })).filter((s) => s.stations.length > 0)
  }, [snapshots, station, brand, search, labels])

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"><p className="text-lg text-gray-600 dark:text-gray-300">Caricamento dati...</p></div>
  if (error) return <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"><p className="text-red-500">Errore: {error}</p></div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">P</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prezzi Carburanti</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sciacca</p>
          </div>
          <button
            onClick={toggleDark}
            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {dark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
          </button>
        </header>

        <KpiCards snapshots={snapshots} onStationDetail={setDetailStation} />
        <Filters
          station={station} brand={brand} search={search}
          brands={brands} stations={stations} stationLabels={labels}
          onStationChange={setStation} onBrandChange={setBrand} onSearchChange={setSearch}
        />

        <div id="tabella-distributori" className="mb-6">
          <StationsTable snapshots={filtered} onStationDetail={setDetailStation} />
        </div>

        <FuelSelector fuel={fuel} onChange={setFuel} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <PriceTrendChart snapshots={filtered} fuel={fuel} />
          <AverageTrendChart snapshots={filtered} fuel={fuel} />
        </div>

        <div className="mb-6">
          <StationMultiLine snapshots={filtered} fuel={fuel} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <StationRanking snapshots={filtered} fuel={fuel} />
          <PriceDistribution snapshots={filtered} fuel={fuel} stationId={station} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <StationBoxPlot snapshots={filtered} fuel={fuel} />
          <PriceHeatmap snapshots={filtered} fuel={fuel} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <StationTimeline snapshots={filtered} fuel={fuel} stationName={station} />
          <PriceChangesChart snapshots={filtered} fuel={fuel} />
        </div>

        <div className="mb-6">
          <CityDiffChart snapshots={filtered} fuel={fuel} />
        </div>

        {detailStation && <StationDetail station={detailStation} onClose={() => setDetailStation(null)} />}

        {showScroll && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center text-xl cursor-pointer">
            &uarr;
          </button>
        )}
      </div>
    </div>
  )
}