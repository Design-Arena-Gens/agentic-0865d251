import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f6f3",
        sidebar: "#f4f1eb",
        slate: {
          950: "#1f1f22"
        }
      },
      boxShadow: {
        card: "0 2px 18px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
