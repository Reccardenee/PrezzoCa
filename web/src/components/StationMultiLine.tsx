import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice, FUEL_LABELS } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function StationMultiLine({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0) return

    const stationSeries = new Map<string, { date: string; price: number }[]>()
    for (const s of snapshots) {
      const date = s.timestamp.slice(0, 10)
      for (const st of s.stations) {
        const price = getFuelPrice(st, fuel)?.price
        if (price === undefined) continue
        const label = st.label || st.name
        const key = label
        if (!stationSeries.has(key)) stationSeries.set(key, [])
        stationSeries.get(key)!.push({ date, price })
      }
    }

    const dates = [...new Set(snapshots.map((s) => s.timestamp.slice(0, 10)))].sort()
    const series = [...stationSeries.entries()]
      .filter(([, pts]) => pts.length > 1)
      .slice(0, 10)
      .map(([name, pts], i) => {
        const map = new Map(pts.map((p) => [p.date, p.price]))
        return {
          name,
          type: "line" as const,
          data: dates.map((d) => map.get(d) ?? null),
          lineStyle: { color: COLORS.palette[i % COLORS.palette.length], width: 2 },
          itemStyle: { color: COLORS.palette[i % COLORS.palette.length] },
        }
      })

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis", valueFormatter },
      legend: { type: "scroll", bottom: 0 },
      xAxis: { type: "category", data: dates },
      yAxis: { type: "value", name: "€/L", scale: true },
      series,
      grid: { left: 60, right: 20, top: 20, bottom: 60 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Prezzi per distributore — {FUEL_LABELS[fuel]}</h3>
      <div ref={ref} style={{ height: 350 }} />
    </div>
  )
}