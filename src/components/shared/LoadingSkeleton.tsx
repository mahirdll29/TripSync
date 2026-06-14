export default function LoadingSkeleton({ count = 4, type = "trip" }: { count?: number; type?: "trip" | "hotel" }) {
  if (type === "hotel") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-bg-surface border border-border-default rounded-[var(--radius-lg)] p-5">
            <div className="flex justify-between mb-3">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-5 w-5 rounded-full" />
            </div>
            <div className="skeleton h-5 w-3/4 mb-3" />
            <div className="skeleton h-4 w-1/2 mb-2" />
            <div className="skeleton h-4 w-full mb-4" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="skeleton h-6 w-6 rounded-full" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-8 w-28 rounded-[var(--radius-md)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bg-surface border border-border-default rounded-[var(--radius-lg)] overflow-hidden">
          <div className="skeleton h-[120px] rounded-none" />
          <div className="p-5">
            <div className="skeleton h-5 w-3/4 mb-3" />
            <div className="flex gap-2 mb-4">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
            <div className="flex justify-between">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
