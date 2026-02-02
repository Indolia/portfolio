(() => {
    const THEME_KEY = 'preferred-theme';
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = toggleBtn.querySelector('i');

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);

        icon.className = theme === 'dark'
            ? 'fas fa-sun'
            : 'fas fa-moon';
    };

    const getSystemTheme = () =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';

    const initTheme = () => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const theme = savedTheme || getSystemTheme();
        setTheme(theme);
    };

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    initTheme();
})();