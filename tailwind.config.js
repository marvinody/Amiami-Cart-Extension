module.exports = {
  purge: {
    enabled: true,
    content: ["src/**/**/*.js", "src/**/**/*.jsx", "dist/**/*.html"]
  },
  theme: {
    extend: {}
  },
  variants: {
    opacity: ({ after }) => after(['disabled']),
  },
  plugins: [
    // require("@tailwindcss/ui")({
    //   layout: "sidebar"
    // })
    require("@tailwindcss/forms")
  ]
};
