function MenuCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm animate-pulse">
      <div className="h-40 bg-aldesCream" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-28 rounded-2xl bg-aldesCream" />
        <div className="h-5 w-3/4 rounded-2xl bg-aldesCream" />
        <div className="h-4 w-full rounded-2xl bg-aldesCream" />
        <div className="h-4 w-5/6 rounded-2xl bg-aldesCream" />
        <div className="h-10 w-full rounded-2xl bg-aldesCream" />
      </div>
    </article>
  )
}

function ListItemSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm animate-pulse">
      <div className="mb-4 h-5 w-1/3 rounded-2xl bg-aldesCream" />
      <div className="space-y-2">
        <div className="h-4 w-11/12 rounded-2xl bg-aldesCream" />
        <div className="h-4 w-4/5 rounded-2xl bg-aldesCream" />
      </div>
    </div>
  )
}

export { MenuCardSkeleton, ListItemSkeleton }
