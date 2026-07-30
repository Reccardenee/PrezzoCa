import { createContext, useContext } from "react"

export interface ThemeContextValue {
  dark: boolean
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({ dark: false, toggle: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export const COLORS = {
  primary: "#0ea5e9",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  sky: "#06b6d4",
  rose: "#f43f5e",
  palette: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4", "#84cc16", "#ec4899"],
}

export function useDarkMode() {
  return useTheme().dark
}

const TEXT_LIGHT = "#374151"
const TEXT_DARK = "#f3f4f6"
const LINE_LIGHT = "#e5e7eb"
const LINE_DARK = "#374151"

function deepMerge(a: Record<string, any>, b: Record<string, any>): Record<string, any> {
  const result = { ...a }
  for (const key of Object.keys(b)) {
    const av = a[key]
    const bv = b[key]
    if (
      av && bv &&
      typeof av === "object" && !Array.isArray(av) &&
      typeof bv === "object" && !Array.isArray(bv)
    ) {
      result[key] = deepMerge(av, bv)
    } else if (bv !== undefined) {
      result[key] = bv
    }
  }
  return result
}

export function createChartOptions(dark: boolean): Record<string, any> {
  const textColor = dark ? TEXT_DARK : TEXT_LIGHT
  const lineColor = dark ? LINE_DARK : LINE_LIGHT
  return {
    backgroundColor: "transparent",
    textStyle: { color: textColor },
    title: { textStyle: { color: textColor } },
    legend: {
      type: "plain",
      textStyle: { color: textColor },
      pageTextStyle: { color: textColor },
    },
    tooltip: {
      backgroundColor: dark ? "#111827" : "#ffffff",
      borderColor: dark ? "#4b5563" : "#e5e7eb",
      textStyle: { color: dark ? "#f9fafb" : "#374151", fontSize: 12 },
    },
    xAxis: {
      axisLine: { lineStyle: { color: lineColor } },
      axisTick: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontWeight: 500 },
      splitLine: { lineStyle: { color: lineColor, type: "dashed" as const } },
    },
    yAxis: {
      axisLine: { lineStyle: { color: lineColor } },
      axisTick: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontWeight: 500 },
      splitLine: { lineStyle: { color: lineColor, type: "dashed" as const } },
    },
  }
}

export function chartOptions(dark: boolean, overrides: Record<string, any>): Record<string, any> {
  return deepMerge(createChartOptions(dark), overrides)
}

export function valueFormatter(v: number): string {
  return v.toFixed(3) + " \u20AC/L"
}
