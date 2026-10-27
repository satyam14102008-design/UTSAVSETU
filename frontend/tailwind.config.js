/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        utsav: {
          maroon: '#800020',
          burgundy: '#580c1f',
          gold: '#D4AF37',
          deepgold: '#AA820A',
          ivory: '#FAF7F2',
          cream: '#F4ECE1',
          terracotta: '#C85A32',
          sand: '#EADBC8',
          charcoal: '#2D2D2D',
          emerald: '#134e4a',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        hindi: ['Rozha One', 'Yatra One', 'serif'],
      }
    },
  },
  plugins: [],
}

