export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-primary': '#696969',
        'surface-secondary': '#292929',
        'text-primary-contrast': '#D1D1D1',
        'text-highlight-coral': '#FFD1D1',
        'accent-spotify-green': '#BAFFB5',
        'accent-electric-blue': '#D1F3FF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}