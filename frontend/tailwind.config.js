const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    darkMode: 'class',
    extend: {
      fontFamily:{
        kh_siemreap: "Khmer OS Siemreap"
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}
