import { useRef, useEffect } from "react"
import * as echarts from "echarts"
import type { Snapshot, FuelType } from "../types"
import { getFuelPrice } from "../api"
import { useDarkMode, chartOptions, COLORS, valueFormatter } from "../theme"

export default function StationTimeline({ snapshots, fuel, stationName }: {
  snapshots: Snapshot[]; fuel: FuelType; stationName: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()
  const fallbackSt = snapshots.length > 0 ? snapshots[snapshots.length - 1].stations[0] : null
  const activeStation = stationName || fallbackSt?.name || ""
  const activeLabel = (() => {
    for (const s of snapshots) {
      for (const st of s.stations) {
        if (st.name === activeStation) return st.label || st.name
      }
    }
    return activeStation
  })()

  useEffect(() => {
    if (!ref.current || snapshots.length === 0 || !activeStation) return

    const points: { date: string; price: number }[] = []
    for (const s of snapshots) {
      for (const st of s.stations) {
        if (st.name !== activeStation) continue
        const price = getFuelPrice(st, fuel)?.price
        if (price === undefined) continue
        points.push({ date: s.timestamp.slice(0, 10), price })
      }
    }

    if (points.length === 0) return

    const chart = echarts.init(ref.current)
    chart.setOption(chartOptions(dark, {
      tooltip: { trigger: "axis", valueFormatter },
      xAxis: { type: "category", data: points.map((p) => p.date) },
      yAxis: { type: "value", name: "€/L", scale: true },
      series: [{
        type: "line",
        data: points.map((p) => p.price),
        smooth: true,
        lineStyle: { color: COLORS.primary, width: 2 },
        itemStyle: { color: COLORS.primary },
        areaStyle: { color: COLORS.primary, opacity: 0.08 },
        markLine: {
          data: [{ type: "average", name: "Media" }],
          lineStyle: { color: COLORS.rose },
          label: { color: dark ? "#e5e7eb" : "#374151" },
        },
      }],
      grid: { left: 60, right: 20, top: 30, bottom: 40 },
    }))
    return () => chart.dispose()
  }, [snapshots, fuel, activeStation, dark])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
        {activeLabel || "Timeline distributore"}
      </h3>
      <div ref={ref} style={{ height: 250 }} />
    </div>
  )
}
