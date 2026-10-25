/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#275637',
          hover: '#1E462B',
          light: '#EBF2ED',
        },
        sage: {
          DEFAULT: '#91BA94',
          light: '#DCE8DE',
          bg: '#F1F5F2',
        },
        badge: {
          green: '#B1D27D',
          yellow: '#F6D05F',
          red: '#B5483A',
        },
        earth: {
          bg: '#F9F9F6',
          card: '#FFFFFF',
          dark: '#275637',
          muted: '#556B5C',
          border: '#91BA94',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Noto Sans"', '"Noto Sans Kannada"', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      maxWidth: {
        'mobile': '480px',
        'content': '760px',
      }
    },
  },
  plugins: [],
}
