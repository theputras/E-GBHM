module.exports = {
  content: [
    "./index.html", 
    "./src/**/*.{html,js}", // Adjust this path to your project files
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#657C6A",
          80: "#708876",
          60: "#8A9F8F",
          40: "#A2B5A5",
        },
        secondary: {
          100: "#A2B9A7",
          80: "#C2D0C3",
          60: "#D0BDDO",
          40: "#DE5DD",
        },
        failed: {
          100: "#B71C1C",
          80: "#C54949",
          60: "#D47777",
          40: "#E2A4A4",
        },
        pending: {
          100: "#F9A825",
          80: "#FAB951",
          60: "#FBCB7C",
          40: "#FDDCA8",
        },
        success: {
          100: "#388E3C",
          80: "#60A563",
          60: "#88B88A",
          40: "#AFD2B1",
        },
        base: {
          100: "#000000",
          80: "#979797",
          60: "#A0A0A2",
          40: "#A8A8A9",
          0: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
