(() => {
    const THEME_KEY = 'preferred-theme';
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = toggleBtn?.querySelector('i');

    const setTheme = (theme, persist = true) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (persist) localStorage.setItem(THEME_KEY, theme);

        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    };

    const getSystemTheme = () =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';

    // Keep a media query list to observe system changes
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const initTheme = () => {
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme) {
            // User has a saved preference -> respect it
            setTheme(savedTheme, true);
        } else {
            // No saved preference -> use system theme for initial paint and follow system changes
            setTheme(getSystemTheme(), false);

            // Listen for future system changes and update only when user hasn't saved a preference
            const systemChangeHandler = (e) => {
                // only apply if user hasn't set a preference
                if (!localStorage.getItem(THEME_KEY)) {
                    setTheme(e.matches ? 'dark' : 'light', false);
                }
            };

            // Use modern addEventListener when available, fall back to addListener for older browsers
            if (typeof mql.addEventListener === 'function') {
                mql.addEventListener('change', systemChangeHandler);
            } else if (typeof mql.addListener === 'function') {
                mql.addListener(systemChangeHandler);
            }
        }
    };

    // Only wire up the toggle if it exists in the DOM
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || getSystemTheme();
            const next = currentTheme === 'dark' ? 'light' : 'dark';
            // Persist because this is an explicit user action
            setTheme(next, true);
        });
    }

    // Initialize
    initTheme();
})();