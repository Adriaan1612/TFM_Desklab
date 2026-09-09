/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF8F5",
        ink: "#1E1E1C",
        moss: {
          DEFAULT: "#7A8B6F",
          dark: "#5F7055",
          soft: "#E7ECE2",
        },
        line: "#E5E0D8",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
