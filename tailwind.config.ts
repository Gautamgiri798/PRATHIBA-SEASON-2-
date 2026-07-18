import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0806",
        char: "#15100B",
        charLight: "#1D1610",
        gold: {
          light: "#F4D77B",
          DEFAULT: "#C9973D",
          deep: "#8B6914",
        },
        maroon: {
          DEFAULT: "#7A1F1F",
          light: "#9C3A32",
        },
        parchment: "#F3ECDC",
        muted: "#A8977C",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #F4D77B 0%, #C9973D 45%, #8B6914 100%)",
        "radial-glow":
          "radial-gradient(circle at 50% 0%, rgba(201,151,61,0.18), transparent 60%)",
      },
      boxShadow: {
        gold: "0 0 30px rgba(201,151,61,0.25)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        rise: "rise 0.5s ease-out both",
        flicker: "flicker 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
