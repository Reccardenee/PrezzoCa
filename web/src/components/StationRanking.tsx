import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function StationRanking({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0) return

    const latest = snapshots[snapshots.length - 1]
    const prices = latest.stations
      .map((st) => ({
        name: st.label || st.name,
        price: getFuelPrice(st, fuel)?.price ?? null,
      }))
      .filter((p): p is { name: string; price: number } => p.price !== null)
      .sort((a, b) => a.price - b.price)

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter },
      xAxis: { type: "value", name: "€/L" },
      yAxis: {
        type: "category",
        data: prices.map((p) => p.name).reverse(),
        axisLabel: { fontSize: 11 },
      },
      series: [{
        type: "bar",
        data: prices.map((p) => p.price).reverse(),
        itemStyle: {
          color: (p: any) => {
            const min = prices[0].price
            const max = prices[prices.length - 1].price
            const ratio = (p.value - min) / (max - min || 1)
            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: COLORS.green },
              { offset: ratio, color: COLORS.amber },
              { offset: 1, color: COLORS.red },
            ])
          },
          borderRadius: [0, 4, 4, 0],
        },
      }],
      grid: { left: 120, right: 20, top: 10, bottom: 40 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Classifica distributori</h3>
      <div ref={ref} style={{ height: 300 }} />
    </div>
  )
}