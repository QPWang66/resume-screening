/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Earthy/Clay Palette
                background: '#f2f0e9', // Warm alabaster/sand
                surface: '#ffffff',

                primary: {
                    DEFAULT: '#e65100', // International Orange / Burnt Orange
                    hover: '#c2410c',
                    light: '#ffccbc',
                },

                secondary: {
                    DEFAULT: '#1c1917', // Warm Black/Charcoal
                    dim: '#44403c',
                },

                accent: {
                    green: '#15803d',
                    red: '#b91c1c',
                    yellow: '#a16207',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['Fraunces', 'serif'],
                display: ['Fraunces', 'serif'],
            },
            borderRadius: {
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'sharp': '4px 4px 0px 0px rgba(0,0,0,1)', // Brutalist shadow
                'sharp-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
                'sharp-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
            }
        },
    },
    plugins: [],
}
