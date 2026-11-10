/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          deep: '#176B67',
          secondary: '#2E8580',
          sage: '#DCECE7',
          border: '#E5ECE9',
        },
        sahaaya: {
          bg: '#F8FAF8',
          text: '#202C2B',
          secondary: '#687775',
          accent: '#E8B86D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
