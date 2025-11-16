import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard Variable', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc171',
          400: '#ff9c38',
          500: '#fe7e11',
          600: '#ef6307',
          700: '#c64908',
          800: '#9d390f',
          900: '#7e3010',
        },
        pastel: {
          pink: '#FFD6E8',
          purple: '#E8D6FF',
          blue: '#D6E8FF',
          mint: '#D6FFED',
          yellow: '#FFF6D6',
          peach: '#FFE6D6',
        },
      },
      borderRadius: {
        'cute': '1.25rem',
        'super-cute': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
