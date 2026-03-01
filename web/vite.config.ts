import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash]-[hash].js`,
        assetFileNames: `assets/[name]-[hash]-[hash].[ext]`,
      }
    }
  }
});
