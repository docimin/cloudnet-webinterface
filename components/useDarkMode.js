import { useEffect, useState } from "react";

function useDarkMode() {
  const [theme, setTheme] = useState(
    typeof localStorage !== "undefined" ? localStorage.theme : "light"
  );
  const colorTheme = theme === "dark" ? "light" : "dark";
  const [osTheme, setOsTheme] = useState("light");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(colorTheme);
    root.classList.add(theme);

    if (typeof window !== "undefined") {
      const newOsTheme =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      setOsTheme(newOsTheme);

      if (localStorage.theme === undefined) {
        localStorage.setItem("theme", newOsTheme);
      } else {
        localStorage.setItem("theme", theme);
      }
    }

    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [colorTheme, theme]);

  return [colorTheme, setTheme, osTheme];
}

export default useDarkMode;
