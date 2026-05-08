import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["ui-serif", "Georgia", "serif"]
      },
      colors: {
        ink: "#0b0d12",
        accent: "#ff6a00",
        muted: "#6b7280"
      },
      maxWidth: {
        prose: "68ch"
      }
    }
  },
  plugins: []
};

export default config;
