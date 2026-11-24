/** Wordmark: wallet, rupee coin and chart bars mark with the app name. */
export default function Logo({ compact = false, inverted = false, className = '' }) {
  const bg = inverted ? 'rgb(var(--hero-ink))' : 'rgb(var(--accent))';
  const fg = inverted ? 'rgb(var(--hero))' : 'rgb(var(--accent-ink))';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill={bg} />
        <line x1="14.2" y1="10.2" x2="16.2" y2="14.2" stroke={fg} strokeWidth="2.3" strokeLinecap="round" />
        <line x1="9.2" y1="14.8" x2="13.2" y2="16.6" stroke={fg} strokeWidth="2.3" strokeLinecap="round" />
        <rect x="33.2" y="17.8" width="5.0" height="12.0" rx="1.6" fill={fg} />
        <rect x="39.6" y="13.0" width="5.2" height="16.5" rx="1.6" fill={fg} />
        <rect x="46.2" y="8.4" width="5.4" height="21.5" rx="1.6" fill={fg} />
        <circle cx="24" cy="22.8" r="8.2" fill={fg} />
        <path d="M21.2 19.3h5.6M21.2 21.8h5.6M22.9 19.3c2.4 0 2.4 4.5 0 4.5h-1.7l3.8 3.5" fill="none" stroke={bg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M11.6 26.5 C12.4 26.0 13.6 26.6 14.3 28.0 C16.6 32.8 21.0 34.6 25.5 34.4 C31.0 34.2 37.5 31.2 42.6 29.0 C46.8 27.2 51.8 29.2 51.8 34.2 L51.8 49.0 C51.8 53.2 48.8 55.8 44.6 55.8 L18.4 55.8 C13.4 55.8 10.6 52.8 10.6 47.6 L10.6 28.2 C10.6 27.1 11.0 26.7 11.6 26.5 Z"
          fill={fg}
          stroke={bg}
          strokeWidth="4.4"
          strokeLinejoin="round"
          paintOrder="stroke"
        />
        <rect x="40.2" y="36.2" width="15.0" height="11.6" rx="5.8" fill={bg} />
        <rect x="42.2" y="38.2" width="13.2" height="7.6" rx="3.4" fill={fg} />
        <circle cx="46.2" cy="42.0" r="1.7" fill={bg} />
      </svg>
      {!compact && <span className="text-[22px] font-extrabold tracking-tight" style={{ letterSpacing: '-0.04em' }}>kharcha</span>}
    </span>
  );
}
