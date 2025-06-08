// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ¡Esta línea es CLAVE! Asegúrate de que apunte a tus archivos .tsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}