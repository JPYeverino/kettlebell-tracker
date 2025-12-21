import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/kettlebell-tracker/', // GitHub Pages repository path
  build: {
    target: 'es2020',
  },
})
