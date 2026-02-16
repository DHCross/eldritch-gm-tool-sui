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
        // New Palette
        "royal-amethyst": "#6B21A8", // Purple-800
        "deep-indigo": "#312e81", // Indigo-900
        "emerald-green": "#10b981", // Emerald-500
        "vibrant-moss": "#65a30d", // Lime-600
        "obsidian": "#050505", // Very Dark Gray/Black
        "sharp-silver": "#e5e7eb", // Gray-200

        // Legacy/Mapped Colors (keeping for compatibility but remapped where appropriate)
        "charcoal-violet": "#0d0a12", // keeping original dark bg color just in case
        "muted-eldritch-green": "#10b981", // Mapped to Emerald
        "soft-amethyst": "#a855f7", // Purple-500, slightly lighter than Royal Amethyst
        "btn-bg": "#6B21A8", // Mapped to Royal Amethyst
        "btn-hover": "#7e22ce", // Purple-700
        "off-white": "#e5e7eb", // Mapped to Sharp Silver
      },
      fontFamily: {
        serif: ["var(--font-spectral)", "serif"],
        display: ["var(--font-cinzel)", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
