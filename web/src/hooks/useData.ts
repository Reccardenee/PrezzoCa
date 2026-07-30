import { useState, useEffect } from "react"
import type { Snapshot } from "../types"
import { loadAllYears } from "../api"

export function useData() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllYears()
      .then(setSnapshots)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { snapshots, loading, error }
}
