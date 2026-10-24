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
        background: "var(--background)",
        foreground: "var(--foreground)",
        champions: {
          bg: "#050814",
          card: "#0d152c",
          cardHover: "#131d3d",
          border: "#1e2c56",
          blue: "#0a2569",
          electric: "#00f0ff",
          gold: "#ffd700",
          goldDark: "#b8860b",
          silver: "#c0c0c0",
          teamBlue: "#2563eb",
          teamRed: "#dc2626",
        },
      },
      backgroundImage: {
        "champions-gradient": "radial-gradient(ellipse at top, #11255e 0%, #050814 70%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
        "gold-gradient": "linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)",
        "fifa-card": "linear-gradient(145deg, #162447 0%, #0d152c 60%, #1a1a2e 100%)",
        "fifa-gold": "linear-gradient(145deg, #e5b80b 0%, #a67c00 45%, #e5b80b 100%)",
      },
      boxShadow: {
        "electric-glow": "0 0 25px rgba(0, 240, 255, 0.35)",
        "gold-glow": "0 0 25px rgba(255, 215, 0, 0.4)",
        "card-glow": "0 10px 30px -10px rgba(0,0,0,0.7)",
      },
    },
  },
  plugins: [],
};
export default config;

