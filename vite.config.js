import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import mockApi from './dev/mockApi.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mockApi()],
})
