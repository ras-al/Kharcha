import { CloudSlash } from '@phosphor-icons/react';
import { useOnline } from '../hooks/useOnline';

/** Quiet notice that changes are being kept on the device. */
export default function OfflineBanner({ className = '' }) {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className={`flex items-center gap-2 bg-warn/15 text-warn font-semibold text-sm px-4 py-2 ${className}`}>
      <CloudSlash size={18} weight="bold" aria-hidden="true" />
      Offline. Changes are saved on this device and sync when you reconnect.
    </div>
  );
}
