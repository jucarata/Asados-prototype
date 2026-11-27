// @ts-check
import { defineConfig } from 'astro/config';

// Project Pages URL: https://jucarata.github.io/Asados-prototype/
// Locally keep base `/` so `astro dev` stays at http://localhost:4321/
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

// https://astro.build/config
export default defineConfig({
  site: 'https://jucarata.github.io',
  base: isGitHubActions ? '/Asados-prototype' : '/',
});
