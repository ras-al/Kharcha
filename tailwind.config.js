/** Design tokens live in src/styles/index.css as CSS variables so light/dark swap in one place. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        sunk: token('sunk'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        accent: token('accent'),
        'accent-ink': token('accent-ink'),
        'accent-hover': token('accent-hover'),
        hero: token('hero'),
        'hero-ink': token('hero-ink'),
        'hero-muted': token('hero-muted'),
        'chart-bar': token('chart-bar'),
        expense: token('expense'),
        income: token('income'),
        warn: token('warn'),
        'on-expense': token('on-expense'),
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
      // Radius scale: cards 14px, inner tiles and controls 10px, segments 7px, badges 6px.
      borderRadius: {
        card: '14px',
        tile: '10px',
        control: '10px',
        segment: '7px',
        badge: '6px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(10 10 10 / 0.05), 0 8px 24px -12px rgb(10 10 10 / 0.10)',
        lift: '0 16px 48px -16px rgb(10 10 10 / 0.28)',
      },
      spacing: { 'safe-b': 'env(safe-area-inset-bottom)', 'safe-t': 'env(safe-area-inset-top)' },
    },
  },
  plugins: [],
};
