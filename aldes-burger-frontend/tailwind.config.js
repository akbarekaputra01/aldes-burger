/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aldesRed: '#D52518',    // Terracotta Red
        aldesYellow: '#FFC926', // Mustard Yellow
        aldesCream: '#F3E8CC',  // Warm Cream
      },
    },
  },
  plugins: [],
}