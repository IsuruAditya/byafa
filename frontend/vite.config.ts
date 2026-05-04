import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id: string) {
          if (id.includes('@stripe')) return 'vendor-stripe'
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms'
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor-redux'
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
        },
      },
    },
  },
})
