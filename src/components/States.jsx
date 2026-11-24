import { CircleNotch, WarningCircle } from '@phosphor-icons/react';

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="card p-3 space-y-1" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-2 py-2.5">
          <Skeleton className="w-11 h-11 rounded-control" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      {Icon && (
        <span className="grid place-items-center w-16 h-16 rounded-[14px] bg-sunk mb-4">
          <Icon size={30} weight="bold" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-xl">{title}</h3>
      {children && <p className="text-muted mt-1.5 max-w-sm">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const offline = !navigator.onLine;
  return (
    <div role="alert" className="card flex items-start gap-3 p-5">
      <WarningCircle size={26} weight="fill" className="text-expense shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-bold">Could not load this.</p>
        <p className="text-sm text-muted mt-0.5">
          {offline ? 'You are offline and nothing is cached for this view yet.' : error?.code === 'permission-denied' ? 'Your account does not have access to this data.' : 'Something went wrong talking to the database.'}
        </p>
        {onRetry && <button type="button" className="btn-secondary btn-sm mt-3" onClick={onRetry}>Try again</button>}
      </div>
    </div>
  );
}

export function LoadingScreen({ label = 'Loading' }) {
  return (
    <div className="min-h-[60vh] grid place-items-center" role="status" aria-label={label}>
      <CircleNotch size={32} weight="bold" className="spin text-muted" />
    </div>
  );
}
