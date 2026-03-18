interface SkeletonCardProps {
  variant?: 'default' | 'hero';
}

export default function SkeletonCard({ variant = 'default' }: SkeletonCardProps) {
  if (variant === 'hero') {
    return (
      <div className="rounded-3xl overflow-hidden animate-pulse">
        <div className="skeleton h-[480px] md:h-[560px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-2.5 w-16 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 rounded w-full" />
          <div className="skeleton h-4 rounded w-3/4" />
        </div>
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="skeleton w-6 h-6 rounded-full" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton w-6 h-6 rounded-lg" />
            <div className="skeleton w-6 h-6 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
