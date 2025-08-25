import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#ffffff", // white background
        foreground: "#000000", // black text
        primary: {
          DEFAULT: "#000000", // black text primary
          foreground: "#ffffff", // white text on primary background
          light: "#f0f0f0",
          dark: "#1a1a1a",
        },
        secondary: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ff0000", // optional red for destructive actions
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#e0e0e0",
          foreground: "#000000",
        },
        accent: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        success: {
          DEFAULT: "#00b300",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#ff9900",
          foreground: "#ffffff",
        },
        info: {
          DEFAULT: "#0099ff",
          foreground: "#ffffff",
        },
        table: {
          header: "#f8f8f8",
          "row-even": "#ffffff",
          "row-hover": "#f0f0f0",
        },
        sidebar: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
          primary: "#000000",
          "primary-foreground": "#ffffff",
          accent: "#000000",
          "accent-foreground": "#ffffff",
          border: "#e0e0e0",
          ring: "#d0d0d0",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%)",
        "gradient-secondary": "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
        "gradient-hero": "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
