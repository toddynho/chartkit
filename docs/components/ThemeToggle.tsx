"use client";

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label="Toggle color theme"
      onClick={() => {
        const root = document.documentElement;
        const dark = !root.classList.contains("dark");
        root.classList.toggle("dark", dark);
        root.style.colorScheme = dark ? "dark" : "light";
        try {
          localStorage.setItem("ck-theme", dark ? "dark" : "light");
        } catch {
          /* private mode */
        }
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 2a7 7 0 0 0 0 14V2z" fill="currentColor" />
      </svg>
    </button>
  );
}
