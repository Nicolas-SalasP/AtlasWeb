/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                atlas: {
                    900: '#06142E', // Azul oscuro profundo
                    800: '#0F2A4A', // Azul corporativo
                    500: '#1E4C85', // Azul medio
                    300: '#5C9CE6', // Azul claro
                },
                tech: {
                    gray: '#F3F4F6', // Fondo secciones claras
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}