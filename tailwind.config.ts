import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        encre: '#1E2A5A',
        'encre-2': '#2C3A70',
        accent: '#C2410C',
        fond: '#F2F4F8',
        texte: '#141A33',
        doux: '#4A5370',
        ligne: '#E1E5EF',
        vert: '#166534',
        pale: '#E4E8F4',
      },
      fontFamily: {
        titre: ['var(--font-titre)', 'DM Sans', 'sans-serif'],
        corps: ['var(--font-corps)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
