import { Link } from 'react-router-dom';

export default function LegalLinks({ className = '' }) {
  return (
    <p className={`text-sm text-muted ${className}`}>
      <Link to="/privacy" className="font-semibold underline underline-offset-2 hover:text-ink">Privacy policy</Link>
      <span aria-hidden="true"> · </span>
      <Link to="/terms" className="font-semibold underline underline-offset-2 hover:text-ink">Terms of use</Link>
    </p>
  );
}
