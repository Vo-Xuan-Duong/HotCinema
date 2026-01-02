/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: false, // Disable dark mode
    theme: {
        extend: {
            colors: {
                // HotCinemas brand colors
                primary: {
                    DEFAULT: '#e50914',
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#e50914',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                secondary: {
                    DEFAULT: '#1f2937',
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            },
            boxShadow: {
                'custom-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'custom-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'custom-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            keyframes: {
                fadeInOverlay: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' }
                },
                fadeInTitle: {
                    'from': { opacity: '0', transform: 'translateY(-20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' }
                },
                fadeInCard: {
                    'from': { opacity: '0', transform: 'scale(0.95)' },
                    'to': { opacity: '1', transform: 'scale(1)' }
                },
                fadeInUp: {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' }
                },
                bgImageFloat: {
                    '0%, 100%': { transform: 'scale(1.08) translateY(0)' },
                    '50%': { transform: 'scale(1.10) translateY(-10px)' }
                },
                slideIn: {
                    'from': { width: '0', opacity: '0' },
                    'to': { width: '80px', opacity: '1' }
                },
                iconFloat: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' }
                },
                slideIn: {
                    'from': { transform: 'translateY(20px)', opacity: '0' },
                    'to': { transform: 'translateY(0)', opacity: '1' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '33%': { transform: 'translateY(-20px) rotate(120deg)' },
                    '66%': { transform: 'translateY(10px) rotate(240deg)' }
                },
                dotPulse: {
                    '0%, 80%, 100%': { transform: 'scale(1)', opacity: '0.5' },
                    '40%': { transform: 'scale(1.2)', opacity: '1' }
                },
                progressFill: {
                    '0%': { width: '0%', transform: 'translateX(-100%)' },
                    '50%': { width: '80%', transform: 'translateX(0%)' },
                    '100%': { width: '100%', transform: 'translateX(10%)' }
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 6px 20px rgba(24, 144, 255, 0.4)' },
                    '50%': { boxShadow: '0 6px 20px rgba(24, 144, 255, 0.6)' }
                },
                pulseDot: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.7', transform: 'scale(1.1)' }
                },
                fadeInUp: {
                    'from': { opacity: '0', transform: 'translateY(10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' }
                },
                typing: {
                    '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
                    '30%': { transform: 'translateY(-10px)', opacity: '1' }
                },
                slideInUp: {
                    'from': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
                    'to': { opacity: '1', transform: 'translateY(0) scale(1)' }
                },
                fadeInRooms: {
                    'from': { opacity: '0', transform: 'translateY(-10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' }
                }
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease forwards',
                'bg-float': 'bgImageFloat 20s ease-in-out infinite'
            }
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('tailwindcss-animate'),
    ],
    corePlugins: {
        preflight: true,
    },
}
