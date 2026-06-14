"use client"

const SOURCE_CONFIG: Record<string, { color: string; label: string }> = {
  Agoda: { color: "#E31837", label: "Agoda" },
  MakeMyTrip: { color: "#E8441E", label: "MakeMyTrip" },
  Goibibo: { color: "#E87722", label: "Goibibo" },
  "Booking.com": { color: "#003580", label: "Booking.com" },
  Airbnb: { color: "#FF385C", label: "Airbnb" },
  OYO: { color: "#D51B1B", label: "OYO" },
  Trivago: { color: "#008ACE", label: "Trivago" },
  Expedia: { color: "#1B5ECC", label: "Expedia" },
  Other: { color: "#555570", label: "Link" },
}

export default function SourceBadge({ source }: { source: string }) {
  const config = SOURCE_CONFIG[source] ?? SOURCE_CONFIG.Other!

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        borderColor: `${config.color}4D`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  )
}
