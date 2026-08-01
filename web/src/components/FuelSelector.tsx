import type { FuelType } from "../types"
import { FUEL_LABELS } from "../api"

const FUELS: FuelType[] = ["diesel_self", "diesel_servito", "gasoline_self", "gasoline_servito"]

interface Props {
  fuel: FuelType
  onChange: (v: FuelType) => void
}

export default function FuelSelector({ fuel, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {FUELS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            fuel === f
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400"
          }`}
        >
          {FUEL_LABELS[f]}
        </button>
      ))}
    </div>
  )
}
