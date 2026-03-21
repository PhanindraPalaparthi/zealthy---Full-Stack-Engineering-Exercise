/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          zealthy: {
            green: '#2D9B6F',
            'green-dark': '#1F7A54',
            'green-light': '#E8F7F1',
            'green-mid': '#4DB888',
            teal: '#1AACA8',
            'teal-light': '#E6F7F7',
            navy: '#1A2B3C',
            'gray-warm': '#F7F5F2',
            'gray-mid': '#8A9BAB',
            text: '#1A2B3C',
            muted: '#6B7E8F',
          }
        },
        fontFamily: {
          sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
          display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        },
      },
    },
    plugins: [],
  }