/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        greenPrimary: "#004d26",    // verde escuro usado no fundo, botões, etc
        greenHover: "#009951",      // verde do hover
        greenActive: "#006d39",     // verde para estado ativo
        redLogout: "#d9534f",
        redLogoutHover: "#c9302c",
        blackCustom: "#000000",
        blackHover: "#333333",
        grayHover: "#333333",
      },
      width: {
        '450px': '450px',
        '380px': '380px',
        '320px': '320px',
        '90p': '90%',
        '100px': '100px',
      },
      maxWidth: {
        '1200px': '1200px',
      },
      spacing: {
        '20px': '20px',
        '15px': '15px',
        '10px': '10px',
        '5px': '5px',
        '8px': '8px',
        '12px': '12px',
        '4px': '4px',
      },
      borderRadius: {
        '20px': '20px',
        '5px': '5px',
      },
      dropShadow: {
        'custom': '0 2px 4px rgba(0,0,0,0.2)',
      },
      fontSize: {
        'smaller': '0.9rem',
      },
    },
  },
  plugins: [],
}
