/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                tenri: {
                    950: '#0B1120', // Fondo principal (dark ultra)
                    900: '#0F172A', // Fondo base (navbar, sections)
                    800: '#111827', // Cards / containers
                    700: '#1F2937', // Bordes / separadores
                    500: '#22C55E', // Principal (botones, CTA)
                    400: '#4ADE80', // Hover / activo
                    300: '#86EFAC', // Detalles suaves

                    accent: '#38BDF8', // Azul tech (links / highlights)
                },

                neutral: {
                    100: '#F9FAFB',
                    200: '#E5E7EB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'tenri-gradient': 'linear-gradient(135deg, #22C55E 0%, #38BDF8 100%)',
            }
        },
    },
    plugins: [],
}