/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#334155',    // Original text-slate-700
        secondary: '#64748b',  // Original text-slate-500
        background: '#f8fafc', // Original bg-slate-50
        accent: '#3b82f6',     // Default accent
      }
    },
  },

  plugins: [],
}