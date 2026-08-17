/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canopy: {
          50: "#f2f7f3",
          100: "#e0ede2",
          200: "#bcdac1",
          300: "#8fc199",
          400: "#5fa370",
          500: "#3d8354",
          600: "#2f6b4f",
          700: "#265842",
          800: "#204636",
          900: "#1b3a2d",
          950: "#0d2018",
        },
        harvest: {
          400: "#f0b85f",
          500: "#e8a33d",
          600: "#cc8626",
        },
        soil: {
          500: "#6b4a32",
          700: "#4a3323",
        },
        rust: {
          500: "#c1503c",
        },
        cream: "#faf9f4",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Public Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        furrow: "repeating-linear-gradient(180deg, rgba(47,107,79,0.06) 0px, rgba(47,107,79,0.06) 1px, transparent 1px, transparent 14px)",
      },
    },
  },
  plugins: [],
};
