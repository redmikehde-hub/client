export function Skeleton({ className = '', variant = 'rect' }) {
  const baseClass = 'skeleton';
  const variantClass = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded h-4' : 'rounded-xl';
  return <div className={`${baseClass} ${variantClass} ${className}`} />;
}

export function SkeletonCard({ lines = 3, hasImage = false, hasButton = false }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
      {hasImage && <Skeleton className="h-40 w-full" />}
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      {lines > 2 && <Skeleton className="h-4 w-2/3" />}
      {hasButton && <Skeleton className="h-10 w-full mt-2" />}
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function WinnerCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
      <Skeleton variant="circle" className="w-11 h-11" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--casino-dark)] to-[var(--casino-dark)]" />
      <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-8 space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-full max-w-md mx-auto" />
          <Skeleton className="h-6 w-full max-w-sm mx-auto" />
        </div>
        <div className="flex justify-center gap-3">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
      <Skeleton variant="circle" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
        <Skeleton variant="circle" className="w-24 h-24 mx-auto mb-4" />
        <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-[var(--casino-green)]/20 to-[var(--casino-purple)]/20 border border-white/10 p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton variant="circle" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
