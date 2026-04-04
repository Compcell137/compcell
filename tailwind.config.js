/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'gaming': ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        secondary: {
          50: '#fff5e6',
          100: '#ffebcc',
          200: '#ffd699',
          300: '#ffc266',
          400: '#ffad33',
          500: '#ff9900',
          600: '#cc7a00',
          700: '#995c00',
          800: '#663d00',
          900: '#331f00',
        },
      },
      backgroundImage: {
        'gradient-compcell': 'linear-gradient(135deg, #0066ff 0%, #ff9900 100%)',
      },
      animation: {
        blob: 'blob 7s infinite',
        'fade-out': 'fadeOut 0.3s ease-in forwards',
        'slide-in-from-right': 'slideInFromRight 0.3s ease-out',
        'slide-out-to-right': 'slideOutToRight 0.3s ease-in',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            'transform': 'translate(0, 0) scale(1)',
          },
          '33%': {
            'transform': 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            'transform': 'translate(-20px, 20px) scale(0.9)',
          },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInFromRight: {
          '0%': {
            opacity: '0',
            'transform': 'translateX(1000px)',
          },
          '100%': {
            opacity: '1',
            'transform': 'translateX(0)',
          },
        },
        slideOutToRight: {
          '0%': {
            opacity: '1',
            'transform': 'translateX(0)',
          },
          '100%': {
            opacity: '0',
            'transform': 'translateX(1000px)',
          },
        },
      },
    },
  },
  plugins: [],
}
