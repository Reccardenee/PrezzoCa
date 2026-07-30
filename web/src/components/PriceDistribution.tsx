import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
  stationId: string
}

export default function PriceDistribution({ snapshots, fuel, stationId }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0) return

    const prices = snapshots.flatMap((s) => {
      const stations = stationId
        ? s.stations.filter((st) => st.name === stationId)
        : s.stations
      return stations
        .map((st) => getFuelPrice(st, fuel)?.price)
        .filter((p): p is number => p !== undefined)
    })

    if (prices.length === 0) return

    const min = Math.floor(Math.min(...prices) * 1000) / 1000
    const max = Math.ceil(Math.max(...prices) * 1000) / 1000
    const step = Math.max(0.001, (max - min) / 15)
    const bins: Record<string, number> = {}
    for (const p of prices) {
      const bin = (Math.floor(p / step) * step).toFixed(3)
      bins[bin] = (bins[bin] || 0) + 1
    }

    const labels = Object.keys(bins).sort()
    const values = labels.map((l) => bins[l])

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter },
      xAxis: { type: "category", data: labels, axisLabel: { rotate: 45 } },
      yAxis: { type: "value", name: "Frequenza" },
      series: [{
        type: "bar",
        data: values,
        itemStyle: { color: COLORS.primary, borderRadius: [4, 4, 0, 0] },
      }],
      grid: { left: 50, right: 20, top: 10, bottom: 60 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, stationId, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Distribuzione prezzi</h3>
      <div ref={ref} style={{ height: 300 }} />
    </div>
  )
}