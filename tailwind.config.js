/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },



    extend: {

      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))',
      },


      fontFamily: {
        Questrial: ['Questrial', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        kanit: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [],

}
