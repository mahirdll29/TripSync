"use client"

import { Plus } from "lucide-react"
import { SerializedCity } from "@/types"

interface CityTabsProps {
  cities: SerializedCity[]
  activeCityId: string | null
  onCitySelect: (cityId: string) => void
  onAddCity: () => void
  hotelCounts: Record<string, number>
}

export default function CityTabs({
  cities,
  activeCityId,
  onCitySelect,
  onAddCity,
  hotelCounts,
}: CityTabsProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2" role="tablist">
        {cities.map((city) => {
          const isActive = city._id === activeCityId
          const count = hotelCounts[city._id] ?? 0

          return (
            <button
              key={city._id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onCitySelect(city._id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                isActive
                  ? "bg-accent-soft border-accent/40 text-accent font-semibold shadow-[0_0_0_1px_rgba(255,107,53,0.2)]"
                  : "bg-bg-surface border-border-default text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
              }`}
            >
              {city.emoji} {city.name}
              {count > 0 && (
                <span className={`ml-1.5 ${isActive ? "text-accent/70" : "text-text-tertiary"}`}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}

        {/* Add City tab */}
        <button
          onClick={onAddCity}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-dashed border-text-tertiary text-text-tertiary hover:border-accent hover:text-accent transition-all flex items-center gap-1.5"
        >
          <Plus size={14} /> Add City
        </button>
      </div>

      {/* Scroll fade gradients */}
      <div className="absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-bg-base to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-bg-base to-transparent pointer-events-none" />
    </div>
  )
}
