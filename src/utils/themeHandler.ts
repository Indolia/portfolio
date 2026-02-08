/**
 * Theme handler for light/dark mode with system preference detection.
 * Persists user preference and supports smooth transitions.
 */

const THEME_KEY = "preferred-theme";
const TOGGLE_ID = "theme-toggle";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme: Theme, persist = true): void {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) {
    localStorage.setItem(THEME_KEY, theme);
  }

  const icon = document.querySelector(`#${TOGGLE_ID} i`);
  if (icon) {
    icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }
}

export function initTheme(): void {
  const toggleBtn = document.getElementById(TOGGLE_ID);
  const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;

  if (savedTheme) {
    setTheme(savedTheme, true);
  } else {
    setTheme(getSystemTheme(), false);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const systemChangeHandler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? "dark" : "light", false);
      }
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", systemChangeHandler);
    } else if (typeof (mql as MediaQueryList & { addListener?: (e: MediaQueryListEvent) => void }).addListener === "function") {
      (mql as MediaQueryList & { addListener: (e: MediaQueryListEvent) => void }).addListener(systemChangeHandler);
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const currentTheme =
        (document.documentElement.getAttribute("data-theme") as Theme) ||
        getSystemTheme();
      const next: Theme = currentTheme === "dark" ? "light" : "dark";
      setTheme(next, true);
    });
  }
}
