import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Using custom domain
  build: {
    target: 'es2020',
  },
})
