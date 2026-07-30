import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function PriceHeatmap({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0) return
    const latest = snapshots[snapshots.length - 1]
    const stations = latest.stations
      .map((st) => ({
        name: st.label || st.name,
        price: getFuelPrice(st, fuel)?.price,
      }))
      .filter((s): s is { name: string; price: number } => s.price !== undefined)
      .sort((a, b) => a.price - b.price)

    if (stations.length < 2) return

    const prices = stations.map((s) => s.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { valueFormatter },
      xAxis: { type: "value", name: "€/L" },
      yAxis: {
        type: "category",
        data: stations.map((s) => s.name).reverse(),
        axisLabel: { fontSize: 10, width: 140, overflow: "truncate" },
      },
      series: [{
        type: "scatter",
        data: stations.map((s) => [s.price, s.name]).reverse(),
        symbolSize: 18,
        itemStyle: {
          color: (p: any) => {
            const ratio = (p.data[0] - min) / (max - min || 1)
            if (ratio < 0.33) return COLORS.green
            if (ratio < 0.66) return COLORS.amber
            return COLORS.red
          },
        },
        label: {
          show: true,
          position: "right",
          formatter: (p: any) => `${p.data[0].toFixed(3)}`,
          fontSize: 11,
          color: dark ? "#f3f4f6" : "#374151",
        },
      }],
      grid: { left: 150, right: 70, top: 10, bottom: 40 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Prezzi per distributore</h3>
      <div ref={ref} style={{ height: 300 }} />
    </div>
  )
}
