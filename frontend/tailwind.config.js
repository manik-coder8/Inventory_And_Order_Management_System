/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C2630',
          900: '#14191F',
          800: '#1C2630',
          700: '#2A3540',
          600: '#3D4A56',
          500: '#5B6772',
          400: '#8A8378',
        },
        paper: {
          DEFAULT: '#FAF8F4',
          dim: '#F2EFE8',
          card: '#FFFFFF',
        },
        signal: {
          DEFAULT: '#E8762C',
          50: '#FDF1E7',
          100: '#FBE3CD',
          600: '#D2641F',
          700: '#B0521A',
        },
        forest: {
          DEFAULT: '#3D7A5C',
          50: '#EAF3EE',
          600: '#2F6049',
        },
        rust: {
          DEFAULT: '#B0432F',
          50: '#FBEAE7',
          600: '#943624',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 25, 31, 0.04), 0 1px 1px rgba(20, 25, 31, 0.03)',
        lift: '0 4px 16px rgba(20, 25, 31, 0.08), 0 1px 2px rgba(20, 25, 31, 0.04)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'tape-scroll': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-200px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}