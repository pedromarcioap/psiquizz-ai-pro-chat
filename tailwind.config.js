/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ADD8E6',
        secondary: '#F0F8FF',
        highlight: '#90EE90'
      },
      fontFamily: {
        sans: ['PT Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}