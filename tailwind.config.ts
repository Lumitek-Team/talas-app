import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#070707",
        "text-primary": "#FFFFFF",
        "text-secondary": "#b3b3b3",
        "accent-green": "#5EC85E",
        "container-bg": "#1A1A1A",
      },
      fontFamily: {
        sans: ['var(--font-comfortaa)', 'sans-serif'],
      },
      fontSize: {
        hero: ["4rem", { lineHeight: "1.1" }],
      },
      transitionProperty: {
        blur: 'filter',
      },
      transitionDuration: {
        700: '250ms',
      },
    },
  },
  plugins: [],
};

export default config;