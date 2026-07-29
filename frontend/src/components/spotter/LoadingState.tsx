function Bar({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function LoadingState() {
  return (
    <div className="flex flex-col gap-8 p-5 sm:p-6">
      {/* stat strip */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`px-5 py-4 ${i > 0 ? "border-border" : ""} ${
              i % 2 === 1 ? "border-l" : ""
            } ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
          >
            <Bar className="h-2.5 w-14" />
            <Bar className="mt-3.5 h-6 w-20" />
          </div>
        ))}
      </div>

      {/* section 01 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <Bar className="h-4 w-52" />
          <Bar className="h-2.5 w-16" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bar key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
          <Bar className="h-[430px] w-full rounded-xl" />
          <div className="flex h-[430px] flex-col gap-2 overflow-hidden rounded-xl border border-border bg-surface p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <Bar className="h-8 w-8 shrink-0 rounded-lg" />
                <div className="flex-1">
                  <Bar className="h-3 w-2/3" />
                  <Bar className="mt-2 h-2.5 w-1/3" />
                </div>
                <Bar className="h-3 w-10 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* section 02 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <Bar className="h-4 w-44" />
          <Bar className="h-2.5 w-40" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <Bar className="h-3.5 w-48" />
                <Bar className="mt-2 h-2.5 w-32" />
              </div>
              <Bar className="h-8 w-16 rounded-lg" />
            </div>
            <div className="p-4">
              <Bar className="h-[260px] w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
