const iOSHeight = require('@rvxlab/tailwind-plugin-ios-full-height')

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/client/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    iOSHeight
  ]
}
