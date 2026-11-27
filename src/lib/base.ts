/** Prefix a root-relative public path with Astro `base` (needed on GitHub Pages). */
export function withBase(path = "/"): string {
  const base = import.meta.env.BASE_URL;
  if (!path || path === "/") return base;
  return `${base}${path.replace(/^\//, "")}`;
}
