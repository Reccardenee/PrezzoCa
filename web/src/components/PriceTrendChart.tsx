import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function PriceTrendChart({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0) return

    const data = snapshots
      .map((s) => {
        const prices = s.stations
          .map((st) => getFuelPrice(st, fuel)?.price)
          .filter((p): p is number => p !== undefined)
        return {
          date: s.timestamp.slice(0, 10),
          min: prices.length ? Math.min(...prices) : null,
        }
      })
      .filter((d) => d.min !== null)

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis", valueFormatter },
      xAxis: { type: "category", data: data.map((d) => d.date) },
      yAxis: { type: "value", name: "€/L", scale: true },
      series: [
        {
          name: "Prezzo minimo",
          type: "line",
          data: data.map((d) => d.min),
          smooth: true,
          lineStyle: { color: COLORS.primary, width: 2 },
          areaStyle: { color: COLORS.primary, opacity: 0.12 },
          itemStyle: { color: COLORS.primary },
        },
      ],
      legend: { show: false },
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Andamento prezzo minimo</h3>
      <div ref={ref} style={{ height: 300 }} />
    </div>
  )
}