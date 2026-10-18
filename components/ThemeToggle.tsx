"use client";
// Light/dark switch. The current theme lives on <html data-theme>, so the icon
// is picked by CSS (no state, no hydration mismatch). Choice is remembered on this device.
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("runsphere:theme", next);
    } catch {}
  }
  return (
    <button
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className="grid size-10 place-items-center rounded-full border border-line bg-card shadow-card"
    >
      <Moon aria-hidden className="size-5 dark:hidden" />
      <Sun aria-hidden className="hidden size-5 dark:block" />
    </button>
  );
}
