import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "charcoal-violet": "#0d0a12",
        "muted-eldritch-green": "#7fde73",
        "soft-amethyst": "#b884f3",
        "btn-bg": "#7a4bd8",
        "btn-hover": "#8c5aff",
        "off-white": "#F1F1F1",
      },
    },
  },
  plugins: [],
} satisfies Config;