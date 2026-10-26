let pending: Promise<number | null> | null = null;

/** One GitHub lookup for the whole static build. Missing counts still render the star link. */
export function githubStars(): Promise<number | null> {
  if (!pending) {
    pending = fetch("https://api.github.com/repos/toddynho/chartkit", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "chartkit-web" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { stargazers_count?: unknown };
        return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
      })
      .catch(() => null);
  }
  return pending;
}
