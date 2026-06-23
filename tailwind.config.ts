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
        "active-entry": "var(--color-active-entry)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212, 175, 55, 0.28), 0 18px 44px rgba(8, 11, 22, 0.38)"
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
        display: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', "Georgia", "serif"],
        body: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', "sans-serif"]
      },
      backgroundImage: {
        halo:
          "radial-gradient(circle at top, rgba(212, 175, 55, 0.16), transparent 38%), radial-gradient(circle at bottom right, rgba(56, 89, 138, 0.2), transparent 35%)"
      }
    }
  },
  plugins: []
};

export default config;

