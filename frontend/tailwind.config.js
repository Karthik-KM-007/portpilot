/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        port: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        maritime: {
          blue: '#0369A1',
          light: '#E0F2FE',
          accent: '#0284C7',
        }
      }
    },
  },
  plugins: [],
}
