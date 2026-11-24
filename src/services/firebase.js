/**
 * Firebase app and Auth. Config comes only from VITE_FIREBASE_* env vars.
 * With VITE_USE_EMULATORS=true the app talks to local emulators under the
 * "demo-kharcha" project, which needs no real Firebase account.
 */
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const env = import.meta.env;

export const useEmulators = env.VITE_USE_EMULATORS === 'true';

const config = useEmulators
  ? { apiKey: 'demo-key', projectId: 'demo-kharcha', authDomain: 'demo-kharcha.firebaseapp.com', appId: 'demo' }
  : {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };

/** False when .env is missing; the app then shows setup instructions instead of crashing. */
export const isConfigured = Boolean(config.apiKey && config.projectId);

let app = null;
let auth = null;

if (isConfigured) {
  app = initializeApp(config);
  // Bot protection: App Check proves requests come from this site. Turned on
  // only when a reCAPTCHA Enterprise site key is configured (see README).
  if (!useEmulators && env.VITE_RECAPTCHA_SITE_KEY) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  }
  auth = getAuth(app);
  if (useEmulators) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

// Firestore lives in ./db.js so the sign-in screen does not download it.
export { app, auth };

/*
  Writes are not awaited by the UI: with the persistent cache they apply
  locally at once and the promise only settles when the server confirms,
  which never happens while offline. Failures are reported here instead.
*/
const writeErrorListeners = new Set();

export function onWriteError(listener) {
  writeErrorListeners.add(listener);
  return () => writeErrorListeners.delete(listener);
}

export function track(promise) {
  promise.catch((err) => {
    console.error(err);
    writeErrorListeners.forEach((l) => l(err));
  });
  return promise;
}
