/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#14181F",
          muted: "#4A5568",
        },
        paper: {
          DEFAULT: "#F7F6F2",
          subtle: "#F0EFE9",
        },
        surface: {
          DEFAULT: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E4E1D8",
          dark: "#D1CDC1",
        },
        teal: {
          DEFAULT: "#1F6F5C",
          hover: "#185848",
          light: "#E8F0EE",
        },
        amber: {
          DEFAULT: "#C9862B",
          light: "#F9F3EA",
        },
        danger: {
          DEFAULT: "#B3432B",
          light: "#F7ECEA",
        },
      }
    },
  },
  plugins: [],
};
