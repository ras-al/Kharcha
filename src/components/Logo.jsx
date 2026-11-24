/** Wordmark: a lime rupee tile and the name. Drawn here, not borrowed from any brand. */
export default function Logo({ compact = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill="#9FE870" />
        <path d="M20 18h24M20 28h24M26 18c12 0 12 20 0 20h-6l18 16" fill="none" stroke="#163300" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && <span className="text-[22px] font-extrabold tracking-tight" style={{ letterSpacing: '-0.04em' }}>kharcha</span>}
    </span>
  );
}
