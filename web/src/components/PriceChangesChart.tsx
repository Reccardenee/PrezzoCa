import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice } from "../api"
import { useDarkMode, chartOptions, COLORS } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function PriceChangesChart({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (!ref.current || snapshots.length < 2) return
    const changes: { date: string; count: number }[] = []
    for (let i = 1; i < snapshots.length; i++) {
      const prev = new Map(snapshots[i - 1].stations.map((st) => [st.id, getFuelPrice(st, fuel)?.price]))
      const curr = snapshots[i].stations
      let count = 0
      for (const st of curr) {
        const currPrice = getFuelPrice(st, fuel)?.price
        const prevPrice = prev.get(st.id)
        if (currPrice !== undefined && prevPrice !== undefined && currPrice !== prevPrice) count++
      }
      changes.push({ date: snapshots[i].timestamp.slice(0, 10), count })
    }
    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: changes.map((c) => c.date) },
      yAxis: { type: "value", name: "Variazioni" },
      series: [{
        type: "bar",
        data: changes.map((c) => c.count),
        itemStyle: { color: COLORS.amber, borderRadius: [4, 4, 0, 0] },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, dark])

  if (snapshots.length < 2) return null
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Variazioni prezzi</h3>
      <div ref={ref} style={{ height: 250 }} />
    </div>
  )
}