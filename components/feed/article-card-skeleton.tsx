export function ArticleCardSkeleton() {
  return (
    <article className="rounded-[10px] overflow-hidden bg-[var(--color-bg-2)] border border-[var(--color-border)]">
      <div className="skeleton aspect-video w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton h-4 w-4 rounded-full" />
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-4 w-14 rounded" />
          <div className="skeleton h-3 w-8 ml-auto" />
        </div>
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-8 w-36 ml-auto rounded-[8px]" />
      </div>
    </article>
  );
}
