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
        focus: {
          400: withOpacity('214, 100%, 57.5%'), // border input when validation error
        },
        transparent: 'transparent',
        current: 'currentColor',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          100: withOpacity('1, 100%, 95%'),
          200: withOpacity('1, 100%, 90%'),
          300: withOpacity('1, 100%, 77%'),
          400: withOpacity('355, 85%, 52%'),
        },
        secondary: {
          400: 'hsl(var(--secondary-400))',
          500: 'hsl(var(--secondary-500))',
          600: 'hsl(var(--secondary-600))',
          700: 'hsl(var(--secondary-700))',
          900: 'hsl(var(--secondary-900))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
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
        'loading-bar': {
          '0%': {
            left: '0%',
            right: '100%',
            width: '0%',
          },
          '10%': {
            left: '0%',
            right: '75%',
            width: '25%',
          },
          '90%': {
            right: '0%',
            left: '75%',
            width: '25%',
          },
          '100%': {
            left: '100%',
            right: '0%',
            width: '0%',
          },
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
        'loading-bar': 'loading-bar 2s linear infinite',
      },
      zIndex: {
        '100': '100',
      },
      boxShadow: {
        'table-header': '0px 2px 5px #e5e7eb, 0px -1px #e5e7eb',
      },
    },
  },
} satisfies Config
