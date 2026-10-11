export default function Loading() {
  return <section role="status" aria-label="Loading page" className="py-4">
    <p className="font-medium text-muted">Loading your page…</p>
    <div aria-hidden="true" className="mt-6 grid gap-4 sm:grid-cols-2">
      {[1,2,3,4].map(item=><div key={item} className="h-28 rounded-2xl border border-line bg-surface motion-safe:animate-pulse"/>)}
    </div>
  </section>;
}
