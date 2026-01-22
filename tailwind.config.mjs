/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ministry: 'rgba(218, 41, 28, <alpha-value>)',
        primary: {
          DEFAULT: '#178066',
          light: '#62d2a2',
          medium: '#1fab89',
        },
        surface: '#fefefe',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
