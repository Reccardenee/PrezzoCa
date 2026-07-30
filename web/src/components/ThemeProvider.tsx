import { useEffect, useState, type ReactNode } from "react"
import { ThemeContext } from "../theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("prezzica-theme")
    if (stored) return stored === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("prezzica-theme", dark ? "dark" : "light")
  }, [dark])

  const toggle = () => setDark((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
