import { type Config } from 'tailwindcss'
import { type RecursiveKeyValuePair } from 'tailwindcss/types/config'
import defaultTheme from 'tailwindcss/defaultTheme.js'

function withOpacity(variableName: string) {
  return (({ opacityValue }) => {
    if (opacityValue != null) {
      return `hsla(${variableName}, ${opacityValue})`
    }
    return `hsl(${variableName})`
  }) as unknown as string | RecursiveKeyValuePair<string, string>
}

export default {
  content: ['./src/**/*.{ts,tsx}'],
  plugins: [require('tailwindcss-animate')],
  theme: {
    extend: {
      colors: {
        primary: {
          300: withOpacity('1, 100%, 77%'), // sidebar hover bg
          400: withOpacity('355, 85%, 52%'), // confirm btn
        },
        secondary: {
          400: withOpacity('210, 10%, 96%'), // sidebar bg, tab bg
          500: withOpacity('180, 2%, 92%'), // maporg bg, input bg
          600: withOpacity('210, 1%, 71%'), // maporg node, cancel btn
          700: withOpacity('210, 1%, 53%'), // card header
          900: withOpacity('0, 1%, 34%'), // nav
        },
        focus: {
          400: withOpacity('214, 100%, 57.5%'), // border input when validation error
        },
        transparent: 'transparent',
        current: 'currentColor',
      },
      fontFamily: {
        sans: ['FS PFBeauSansPro', 'Roboto', ...defaultTheme.fontFamily.sans],
        pdf: ['Roboto'],
      },
      fontSize: {
        // 1rem = 16px
        /** 16px size / 20.8px high / bold */
        h1: ['1rem', { lineHeight: '1.3rem', fontWeight: '600' }],
        h2: ['1rem', { lineHeight: '1.3rem', fontWeight: '600' }],
        'table-header': ['1rem', { lineHeight: '1.3rem', fontWeight: '600' }],

        /** 16px size / 20.8px high / normal */
        'body-md': ['1rem', { lineHeight: '1.3rem', fontWeight: '400' }],
        /** 14px size / 18px high / normal */
        'body-sm': ['0.875rem', { lineHeight: '1.125rem', fontWeight: '400' }],
        /** 12px size / 15.6px high / normal */
        'body-xs': ['0.75rem', { lineHeight: '0.975rem', fontWeight: '400' }],
        /** 12px size / 15.6px high / light */
        'body-light': [
          '0.75rem',
          { lineHeight: '0.975rem', fontWeight: '300' },
        ],
      },
      screens: {
        // => @media (min-width: 275.98px) { ... }
        xs2: '275.98px',
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
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          from: { opacity: '0', transform: 'translateX(2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
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
      zIndex: {
        '100': '100',
      },
    },
  },
} satisfies Config
