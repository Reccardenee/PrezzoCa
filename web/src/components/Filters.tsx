import type { ReactNode } from "react"

interface StationItem {
  id: number
  name: string
}

interface Props {
  station: string
  brand: string
  search: string
  brands: string[]
  stations: StationItem[]
  stationLabels: Map<string, string>
  onStationChange: (v: string) => void
  onBrandChange: (v: string) => void
  onSearchChange: (v: string) => void
}

export default function Filters({
  station, brand, search,
  brands, stations, stationLabels,
  onStationChange, onBrandChange, onSearchChange,
}: Props) {
  const stationOpts = stations.map((st) => ({
    value: st.name,
    label: stationLabels.get(String(st.id)) || st.name,
  }))
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-end justify-center">
        <Select label="Distributore" value={station} onChange={onStationChange}>
          <option value="">Tutti</option>
          {stationOpts.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
        </Select>
        <Select label="Marchio" value={brand} onChange={onBrandChange}>
          <option value="">Tutti</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </Select>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Ricerca</label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca..."
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  )
}

function Select({ label, value, onChange, children }: {
  label: string
  value: string
  onChange: (v: any) => void
  children: ReactNode
}) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        {children}
      </select>
    </div>
  )
}