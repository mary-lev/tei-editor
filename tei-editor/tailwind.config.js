/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        'primary-dark': "var(--color-primary-dark)",
        secondary: "var(--color-secondary)",
        'secondary-dark': "var(--color-secondary-dark)",
        muted: "var(--color-neutral-500)",
        neutral: {
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
        }
      },
      fontSize: {
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        '2xl': "var(--font-size-2xl)",
        '3xl': "var(--font-size-3xl)",
      }
    }
  },
  plugins: []
}
