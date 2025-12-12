import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wingy color palette
        sand: '#F7F3E9',
        chocolate: '#4A3B2A',
        'chocolate-light': '#6B4F3A',
        'chocolate-dark': '#3D2F20',
        gold: '#D4A574',
        'gold-light': '#E6C495',
        'gold-dark': '#C49563',
        cream: '#FEFCF7',
        'brown-light': '#8B6F47',
        'brown-dark': '#5D4E37',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #F7F3E9 0%, #FEFCF7 100%)',
        'gradient-chocolate': 'linear-gradient(135deg, #4A3B2A 0%, #6B4F3A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A574 0%, #E6C495 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
