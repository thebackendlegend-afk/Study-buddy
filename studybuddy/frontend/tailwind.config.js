export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#050505',
        panel: '#0a0a0f',
        accent: '#00ff9d',
        accentDark: '#0ee7a0',
        glow: '#00ff9d',
      },
      boxShadow: {
        glow: '0 0 30px rgba(0, 255, 157, 0.25)',
      },
      backgroundImage: {
        hacker: 'radial-gradient(circle at top, rgba(0,255,157,0.12), transparent 24%), radial-gradient(circle at bottom right, rgba(124,58,237,0.08), transparent 28%)',
      },
    },
  },
  plugins: [],
};
