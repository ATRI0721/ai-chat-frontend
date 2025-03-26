/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  daisyui: {
    themes: ["light", "dark"],
  },
  plugins: [daisyui],
};

