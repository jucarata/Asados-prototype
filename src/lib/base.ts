/** Prefix a root-relative public path with Astro `base` (needed on GitHub Pages). */
export function withBase(path = "/"): string {
  const raw = import.meta.env.BASE_URL || "/";
  const base = raw.endsWith("/") ? raw : `${raw}/`;
  if (!path || path === "/") return base;
  return `${base}${path.replace(/^\//, "")}`;
}
