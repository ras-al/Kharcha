import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Public URL used in social tags, the sitemap and robots.txt. Defaults to
 * the Firebase Hosting address; set VITE_SITE_URL for a custom domain.
 */
function siteUrl(mode) {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const url = env.VITE_SITE_URL || (env.VITE_FIREBASE_PROJECT_ID ? `https://${env.VITE_FIREBASE_PROJECT_ID}.web.app` : 'http://localhost:5173');
  return url.replace(/\/$/, '');
}

// Only these pages are useful to search engines; the rest need a sign-in.
const PUBLIC_PATHS = ['/', '/privacy', '/terms'];
// Signed-in screens; crawlers would only ever see the sign-in form there.
const APP_PATHS = ['/transactions', '/stats', '/fees', '/budgets', '/events', '/reports', '/settings', '/more'];

function seoFiles(url) {
  return {
    name: 'kharcha-seo',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\n${APP_PATHS.map((p) => `Disallow: ${p}`).join('\n')}\n\nSitemap: ${url}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_PATHS.map((p) => `  <url><loc>${url}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    seoFiles(siteUrl(mode)),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Kharcha',
        short_name: 'Kharcha',
        description: 'Daily expense tracker for a student budget, in rupees.',
        theme_color: '#163300',
        background_color: '#F2F4EF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // SheetJS is big; it is lazy-loaded with the import page, so allow it into the precache.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  test: { environment: 'node' },
}));
