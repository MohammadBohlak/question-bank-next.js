/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        dark: "rgb(var(--dark) / <alpha-value>)",
        light: "rgb(var(--light) / <alpha-value>)",

        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-alt": "rgb(var(--bg-alt) / <alpha-value>)",
        "card-bg": "rgb(var(--card-bg) / <alpha-value>)",

        text: "rgb(var(--text) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-light": "rgb(var(--text-light) / <alpha-value>)",
        prim: "rgb(var(--prim) / <alpha-value>)",
        sec: "rgb(var(--sec) ) / <alpha-value>",
        "prim-light": "rgb(var(--prim-light) / <alpha-value>)",
        "sec-dark": "rgb(var(--sec-dark) / <alpha-value>)",

        border: "rgb(var(--border) / <alpha-value>)",
        "border-light": "rgb(var(--border-light) / <alpha-value>)",

        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
