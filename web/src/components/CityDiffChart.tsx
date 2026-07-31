import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice, FUEL_LABELS } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function CityDiffChart({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0) return
    const latest = snapshots[snapshots.length - 1]
    const prices = latest.stations
      .map((st) => ({ name: st.label || st.name, price: getFuelPrice(st, fuel)?.price }))
      .filter((p): p is { name: string; price: number } => p.price !== undefined)
    if (prices.length === 0) return
    const avg = prices.reduce((s, p) => s + p.price, 0) / prices.length
    const data = prices.map((p) => ({ name: p.name, diff: +(p.price - avg).toFixed(3) })).sort((a, b) => a.diff - b.diff)
    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter },
      xAxis: { type: "value", name: "€/L" },
      yAxis: { type: "category", data: data.map((d) => d.name), axisLabel: { fontSize: 10 } },
      series: [{
        type: "bar",
        data: data.map((d) => d.diff),
        itemStyle: {
          color: (p: any) => p.value >= 0 ? COLORS.red : COLORS.green,
          borderRadius: [0, 4, 4, 0],
        },
      }],
      grid: { left: 120, right: 20, top: 10, bottom: 40 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Differenza dalla media — {FUEL_LABELS[fuel]}</h3>
      <div ref={ref} style={{ height: 300 }} />
    </div>
  )
}