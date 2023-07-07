import { useEffect, useState } from "react";

function useDarkMode() {
  const [theme, setTheme] = useState(
    typeof localStorage !== "undefined" ? localStorage.theme : "light"
  );
  const colorTheme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(colorTheme);
    root.classList.add(theme);

    if (typeof window !== "undefined") {
      if (localStorage.theme === undefined) {
        localStorage.setItem("theme", "light");
      } else {
        localStorage.setItem("theme", theme);
      }
    }

    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
  }, [colorTheme, theme]);

  return [colorTheme, setTheme];
}

export default useDarkMode;