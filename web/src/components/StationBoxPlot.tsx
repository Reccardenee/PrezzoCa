import { useRef, useEffect, useMemo } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice, FUEL_LABELS } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

interface Props {
  snapshots: Snapshot[]
  fuel: FuelType
}

export default function StationBoxPlot({ snapshots, fuel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  const data = useMemo(() => {
    const pricesByStation = new Map<string, number[]>()
    for (const s of snapshots) {
      for (const st of s.stations) {
        const price = getFuelPrice(st, fuel)?.price
        if (price === undefined) continue
        const label = st.label || st.name
        if (!pricesByStation.has(label)) pricesByStation.set(label, [])
        pricesByStation.get(label)!.push(price)
      }
    }
    return [...pricesByStation.entries()]
      .filter(([, prices]) => prices.length >= 5)
      .slice(0, 15)
  }, [snapshots, fuel])

  useEffect(() => {
    if (!ref.current || data.length === 0) return

    const boxData = data.map(([, prices]) => {
      const sorted = [...prices].sort((a, b) => a - b)
      const n = sorted.length
      const q1 = sorted[Math.floor(n * 0.25)]
      const q2 = sorted[Math.floor(n * 0.5)]
      const q3 = sorted[Math.floor(n * 0.75)]
      const min = sorted[0]
      const max = sorted[n - 1]
      return [min, q1, q2, q3, max]
    })

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "item", valueFormatter },
      xAxis: { type: "category", data: data.map(([name]) => name), axisLabel: { rotate: 45, fontSize: 10 } },
      yAxis: { type: "value", name: "€/L" },
      series: [{
        type: "boxplot",
        data: boxData,
        itemStyle: { color: COLORS.violet, borderColor: COLORS.primary },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 80 },
    }))
    return () => chart.dispose()
  }, [data, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Box plot distributori — {FUEL_LABELS[fuel]}</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: 350 }}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Dati insufficienti: servono almeno 5 rilevazioni per distributore</p>
        </div>
      ) : (
        <div ref={ref} style={{ height: 350 }} />
      )}
    </div>
  )
}