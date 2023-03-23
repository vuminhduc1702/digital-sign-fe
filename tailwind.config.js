const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          300: 'hsla(1, 100%, 77%, 1)', // sidebar hover bg
          400: 'hsla(355, 85%, 52%, 1)',
        },
        secondary: {
          400: 'hsla(210, 10%, 96%, 1)', // sidebar bg, tab bg
          500: 'hsla(180, 2%, 92%, 1)', // maporg bg, input bg
          600: 'hsla(210, 1%, 71%, 1)', // maporg node
          700: 'hsla(210, 1%, 53%, 1)', // card header
          900: 'hsla(0, 1%, 34%, 1)', // nav
        },
        transparent: 'transparent',
        current: 'currentColor',
      },
      fontFamily: {
        sans: ['FS PFBeauSansPro', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        // 1rem = 16px
        /** 16px size / 20.8px high / bold */
        h1: ['1rem', { lineHeight: '1.3rem', fontWeight: '600' }],
        /** 16px size / 20.8px high / normal */
        h2: ['1rem', { lineHeight: '1.3rem', fontWeight: '400' }],

        /** 14px size / 18px high / normal */
        'body-sm': ['0.875rem', { lineHeight: '1.125rem', fontWeight: '400' }],
        /** 12px size / 15.6px high / normal */
        'body-xs': ['0.75rem', { lineHeight: '0.975rem', fontWeight: '400' }],
      },
      screens: {
        // => @media (min-width: 399.98px) { ... }
        xs: '399.98px',
        // => @media (min-width: 575.98px) { ... }
        sm: '575.98px',
        // => @media (min-width: 767.98px) { ... }
        md: '767.98px',
        // => @media (min-width: 1024px) { ... }
        lg: '1023.98px',
        // => @media (min-width: 1280px) { ... }
        xl: '1279.98px',
        // => @media (min-width: 1536px) { ... }
        '2xl': '1535.98px',
      },
      keyframes: {
        slideDown: {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        slideDownAndFade: {
          from: { opacity: 0, transform: 'translateY(-2px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          from: { opacity: 0, transform: 'translateX(2px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        slideUpAndFade: {
          from: { opacity: 0, transform: 'translateY(2px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          from: { opacity: 0, transform: 'translateX(2px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideDownAndFade:
          'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade:
          'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade:
          'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
