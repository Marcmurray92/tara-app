import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-strong": "var(--color-surface-strong)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        success: "var(--color-success)",
        error: "var(--color-error)",
        border: "var(--color-border)",
        focus: "var(--color-focus)",
        revealed: "var(--color-revealed)",
        active: "var(--color-active)",
        "active-entry": "var(--color-active-entry)",
        "arcade-green": "#ccff00",
        "arcade-blue": "#02f1ff",
        "arcade-pink": "#ff0055",
        "arcade-red": "#ff0055",
        "arcade-yellow": "#fffb02"
      },
      boxShadow: {
        glow: "0 0 0 2px rgba(255,255,255,0.08), 0 0 0 4px rgba(204,255,0,0.12), 0 18px 40px rgba(0,0,0,0.45)",
        arcade: "6px 6px 0 rgba(2,241,255,0.18)"
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)"
      },
      spacing: {
        18: "4.5rem"
      },
      fontFamily: {
        display: ['"Koulen"', '"Arial Black"', '"Impact"', '"Haettenschweiler"', '"Oswald"', "sans-serif"],
        body: ['"Inconsolata"', '"IBM Plex Mono"', '"SFMono-Regular"', "Consolas", "monospace"]
      },
      backgroundImage: {
        halo:
          "radial-gradient(circle at top, rgba(255,0,85,0.18), transparent 32%), radial-gradient(circle at top right, rgba(2,241,255,0.12), transparent 26%), linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.2))"
      }
    }
  },
  plugins: []
};

export default config;
