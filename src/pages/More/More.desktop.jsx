import { Navigate } from 'react-router-dom';

/** The sidebar already lists everything "More" holds on mobile, so desktop goes to Settings. */
export default function MoreDesktop() {
  return <Navigate to="/settings" replace />;
}
