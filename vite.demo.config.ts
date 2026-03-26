import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'demo'),
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // 继承 config 的 host，允许局域网访问
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 继承 config 的 alias
    },
  },
});
