export interface FuelPrice {
  fuelId: number
  name: string
  price: number
  isSelf: boolean
}

export interface StationService {
  id: string
  description: string
}

export interface Station {
  id: number
  name: string
  brand: string
  address?: string
  lat?: number | null
  lng?: number | null
  insertDate: string
  fuels: FuelPrice[]
  phoneNumber?: string
  email?: string
  company?: string
  website?: string
  services?: StationService[]
  openingHours?: Record<string, unknown>
  label?: string
}

export interface Snapshot {
  timestamp: string
  city: string
  radius: number
  stations: Station[]
}

export interface StationMetrics {
  id: number
  name: string
  brand: string
  minPrice: number
  maxPrice: number
  avgPrice: number
  stdDev: number
  currentPrice: number
  variationCount: number
  daysSinceLastChange: number
  diffFromCityAvg: number
  prices: { date: string; price: number }[]
}

export type FuelType = "diesel_self" | "diesel_servito" | "gasoline_self" | "gasoline_servito"

export interface FiltersState {
  fuel: FuelType
  station: string
  brand: string
  dateRange: [string, string]
  search: string
}