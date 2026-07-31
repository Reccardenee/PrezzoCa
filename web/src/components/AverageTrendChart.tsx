import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice, FUEL_LABELS } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function AverageTrendChart({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0) return

    const data = snapshots
      .map((s) => {
        const prices = s.stations
          .map((st) => getFuelPrice(st, fuel)?.price)
          .filter((p): p is number => p !== undefined)
        if (!prices.length) return null
        return {
          date: s.timestamp.slice(0, 10),
          avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis", valueFormatter },
      xAxis: { type: "category", data: data.map((d) => d.date) },
      yAxis: { type: "value", name: "€/L", scale: true },
      series: [{
        name: "Prezzo medio",
        type: "line",
        data: data.map((d) => d.avg),
        smooth: true,
        lineStyle: { color: COLORS.green, width: 2 },
        areaStyle: { color: COLORS.green, opacity: 0.12 },
        itemStyle: { color: COLORS.green },
      }],
      legend: { show: false },
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Andamento prezzo medio — {FUEL_LABELS[fuel]}</h3>
      <div ref={ref} style={{ height: 300 }} />
    </div>
  )
}