/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#E6F2EC",
          100: "#CCE6DA",
          200: "#99CDB6",
          300: "#66B592",
          400: "#339C6E",
          500: "#108858",
          600: "#007944",
          700: "#004D2C",
          800: "#003D23",
          900: "#002E1A",
        },
        text: {
          main: "#0A1A12",
          muted: "#5C6B63",
        },
        surface: {
          DEFAULT: "#FCFDFB",
          tint: "#E6F2EC",
        },
        link: "#006097",
        error: "#D93025",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: [],
  // Prevent conflicts with Angular Material
  corePlugins: {
    preflight: false
  }
};
