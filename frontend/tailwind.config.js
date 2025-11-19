/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",
        accent: "#22d3ee",
        accentDark: "#0ea5e9",
        muted: "#64748b",
        surface: "#0b1120",
      },
      boxShadow: {
        soft: "0 15px 35px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};

