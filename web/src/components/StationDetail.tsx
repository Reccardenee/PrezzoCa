import type { Station } from "../types"
import { stationLabel } from "../api"

interface Props {
  station: Station
  onClose: () => void
}

export default function StationDetail({ station, onClose }: Props) {
  const displayName = stationLabel(station)
  const hasCoords = station.lat != null && station.lng != null
  const searchQuery = station.address
    ? `${station.company || station.name}, ${station.address}`
    : `${station.name}, Sciacca`
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`
  const osmUrl = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lng}#map=17/${station.lat}/${station.lng}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none cursor-pointer">&times;</button>
        </div>
        <div className="space-y-3 text-sm">
          {station.company ? <div className="text-gray-900 dark:text-gray-100 font-semibold">{station.company}</div> : null}

          <div className="border-t border-gray-100 dark:border-gray-700 pt-2" />

          {station.address ? <InfoRow label="Indirizzo" value={station.address} /> : null}
          {hasCoords ? <InfoRow label="Coordinate" value={`${station.lat?.toFixed(5)}, ${station.lng?.toFixed(5)}`} /> : null}
          {station.phoneNumber ? <InfoRow label="Telefono" value={station.phoneNumber} hyperlink={`tel:${station.phoneNumber}`} /> : null}
          {station.email ? <InfoRow label="Email" value={station.email} hyperlink={`mailto:${station.email}`} /> : null}
          {station.website ? <InfoRow label="Sito" value={station.website} hyperlink={station.website.startsWith("http") ? station.website : `https://${station.website}`} /> : null}
          {station.services?.length ? <InfoRow label="Servizi" value={station.services.map((s) => s.description).join(" · ")} /> : null}
          <InfoRow label="Marchio" value={station.brand} />
          <InfoRow label="ID" value={String(station.id)} />
          <InfoRow label="Ultimo aggiornamento" value={station.insertDate} />

          <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
            <span className="text-gray-500 dark:text-gray-400 block mb-1">Prezzi:</span>
            {station.fuels.map((f) => (
              <div key={`${f.fuelId}-${f.isSelf}`} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-900 dark:text-gray-100">{f.name} {f.isSelf ? "Self" : "Servito"}</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{f.price.toFixed(3)} &euro;/L</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors">
              Google Maps &rarr;
            </a>
            {osmUrl ? (
              <a href={osmUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 transition-colors">
                OpenStreetMap &rarr;
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, hyperlink }: { label: string; value: string; hyperlink?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}:</span>
      {hyperlink ? (
        <a href={hyperlink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-right">{value}</a>
      ) : (
        <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{value}</span>
      )}
    </div>
  )
}
