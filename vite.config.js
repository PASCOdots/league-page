import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  server: {
    host: true,
  },
};

export default config;

// import { svelte } from "@sveltejs/vite-plugin-svelte";

// export default {
//   server: {
//     host: true,
//   },
//   plugins: [svelte()],
// };
