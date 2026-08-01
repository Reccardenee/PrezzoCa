import { useState } from "react"
import type { Snapshot, Station } from "../types"
import { getFuelPrice } from "../api"

interface Props {
  snapshots: Snapshot[]
  onStationDetail: (st: Station) => void
}

interface Row {
  station: Station
  name: string
  brand: string
  diesel_self: number | null
  diesel_servito: number | null
  gasoline_self: number | null
  gasoline_servito: number | null
  updated: string
}

export default function StationsTable({ snapshots, onStationDetail }: Props) {
  const [sortKey, setSortKey] = useState<keyof Row>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  if (snapshots.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Tutti i distributori</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Nessun risultato per i filtri selezionati</p>
      </div>
    )
  }
  const latest = snapshots[snapshots.length - 1]

  const rows: Row[] = latest.stations.map((st) => ({
    station: st,
    name: st.label || st.name,
    brand: st.brand,
    diesel_self: getFuelPrice(st, "diesel_self")?.price ?? null,
    diesel_servito: getFuelPrice(st, "diesel_servito")?.price ?? null,
    gasoline_self: getFuelPrice(st, "gasoline_self")?.price ?? null,
    gasoline_servito: getFuelPrice(st, "gasoline_servito")?.price ?? null,
    updated: st.insertDate?.slice(0, 10) ?? "",
  }))

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]

    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1

    const cmp = typeof av === "number"
      ? (av as number) - (bv as number)
      : String(av).localeCompare(String(bv))
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggle = (k: keyof Row) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(k); setSortDir("asc") }
  }

  const th = (label: string, key: keyof Row) => (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 select-none" onClick={() => toggle(key)}>
      {label} {sortKey === key ? (sortDir === "asc" ? "\u25B2" : "\u25BC") : ""}
    </th>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Tutti i distributori</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">{th("Distributore", "name")}{th("Marchio", "brand")}{th("Gasolio Self", "diesel_self")}{th("Gasolio Servito", "diesel_servito")}{th("Benzina Self", "gasoline_self")}{th("Benzina Servito", "gasoline_servito")}{th("Aggiornato", "updated")}<th className="px-4 py-3"></th></tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.station.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{r.name}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.brand}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.diesel_self?.toFixed(3) ?? "-"}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.diesel_servito?.toFixed(3) ?? "-"}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.gasoline_self?.toFixed(3) ?? "-"}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.gasoline_servito?.toFixed(3) ?? "-"}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 text-xs">{r.updated}</td>
              <td className="px-4 py-3">
                <button onClick={() => onStationDetail(r.station)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Dettaglio</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
