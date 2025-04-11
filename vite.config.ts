import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // your main popup page
        background: resolve(__dirname, 'src/background.ts'), // service worker
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === 'background'
              ? 'background.js'
              : 'assets/[name].[hash].js';
        },
      },
    }
  }
})
