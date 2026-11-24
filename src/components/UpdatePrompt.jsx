import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '../context/ToastContext';

/** Offers a reload when a new version of the app has been downloaded. */
export default function UpdatePrompt() {
  const toast = useToast();
  const { needRefresh: [needRefresh], offlineReady: [offlineReady], updateServiceWorker } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      toast('A new version of Kharcha is ready.', { duration: 60000, action: { label: 'Reload', onClick: () => updateServiceWorker(true) } });
    }
  }, [needRefresh, toast, updateServiceWorker]);

  useEffect(() => {
    if (offlineReady) toast('Kharcha now works offline.');
  }, [offlineReady, toast]);

  return null;
}
