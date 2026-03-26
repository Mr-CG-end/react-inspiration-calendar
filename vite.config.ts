import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 告诉 Vite：我们不是在打包一个普通的网站，而是在打包一个供别人下载的函数库 (Library)
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // 入口
      name: 'ReactInspirationCalendar',
      fileName: 'index',
      cssFileName: 'style', // 显式锁定导出的 CSS 文件名为 style.css
    },
    rollupOptions: {
      // 将 react 排除在打包之外
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
