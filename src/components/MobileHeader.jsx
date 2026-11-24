/**
 * Standard top of every phone screen: optional small line above, the page
 * title, and one control on the right, all on a shared baseline.
 */
export default function MobileHeader({ eyebrow, title, action, children }) {
  return (
    <header className="pt-5 pb-1">
      <div className="flex items-end justify-between gap-3 min-h-[56px]">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow truncate">{eyebrow}</p>}
          <h1 className="text-[28px] leading-[1.1] truncate">{title}</h1>
        </div>
        {action && <div className="shrink-0 pb-0.5">{action}</div>}
      </div>
      {children && <p className="text-[15px] text-muted mt-2">{children}</p>}
    </header>
  );
}
