/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C3E50',
        success: '#27AE60',
        warning: '#F39C12',
        danger: '#E74C3C',
        info: '#3498DB',
      },
    },
  },
  plugins: [],
}
