import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        hero: ["4rem", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};

export default config;
