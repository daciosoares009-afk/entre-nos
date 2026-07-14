export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#6D28D9',
                'primary-light': '#8B5CF6',
                'primary-dark': '#2E1065',
                dark: '#080B25',
                background: '#F8F7FC',
                text: '#151326',
                muted: '#686477',
                success: '#16A34A',
                warning: '#F59E0B',
                error: '#DC2626',
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 18px 60px rgba(8, 11, 37, 0.08)',
            },
        },
    },
    plugins: [],
};
