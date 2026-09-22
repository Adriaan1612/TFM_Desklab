export function SkeletonCard(): JSX.Element {
  return (
    <div
      aria-hidden
      className="animate-pulse rounded-2xl border border-line bg-white p-6"
    >
      <div className="h-5 w-2/3 rounded-full bg-line" />
      <div className="mt-4 h-6 w-1/2 rounded bg-line" />
      <div className="mt-2 h-4 w-1/3 rounded bg-line" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }): JSX.Element {
  return (
    <div className="grid gap-6 md:grid-cols-3" aria-label="Cargando">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
