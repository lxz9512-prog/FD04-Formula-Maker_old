import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 妙搭 SDK（slardar 日志等）在浏览器环境访问 Node 的 process 全局
// （process.env / process.emit / process.nextTick 等），纯净 vite 需注入完整 polyfill。
// 单靠 define 替换 process.env 不够——打包产物里还有 process.emit 等残留引用。
const processPolyfill = `<script>
(function () {
  if (window.process) return;
  var noop = function () {};
  window.process = {
    env: ${JSON.stringify({
      NODE_ENV: 'production',
      APP_FLAGS: {
        customToaster: true,
        supportBusinessUser: true,
        supportScrollReveal: true,
        supportTiptapAndStreamdown: true,
      },
    })},
    argv: [],
    platform: 'browser',
    version: '',
    browser: true,
    nextTick: function (fn) { Promise.resolve().then(fn); },
    emit: noop,
    on: noop,
    once: noop,
    off: noop,
    addListener: noop,
    removeListener: noop,
    listeners: function () { return []; },
    cwd: function () { return '/'; },
    toString: function () { return '[object process]'; },
  };
})();
</script>`;

// 纯静态构建/预览配置：绕开妙搭 fullstack-vite-preset 的代理层（依赖平台后端）。
// - dev:    npx vite --config vite.preview.config.ts        → http://localhost:8080/client/
// - build:  npx vite build --config vite.preview.config.ts  → dist-pages/（可部署 GitHub Pages）
// 妙搭平台仍用原 vite.config.ts，两套互不影响。
export default defineConfig({
  root: __dirname,
  // GitHub Pages 子路径部署（lxz9512-prog.github.io/FD04-Formula-Maker/）
  base: '/FD04-Formula-Maker/',
  publicDir: path.resolve(__dirname, 'client/public'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@client/src': path.resolve(__dirname, 'client/src'),
    },
  },
  plugins: [
    react(),
    {
      name: 'inject-process-polyfill',
      transformIndexHtml: {
        order: 'pre' as const,
        handler(html: string) {
          return html.replace('<head>', '<head>' + processPolyfill);
        },
      },
    },
  ],
  define: {
    // 纯静态模式开关：index.tsx 据此跳过依赖平台后端的 AppContainer
    __LOCAL_PREVIEW__: JSON.stringify(true),
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-pages'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'client/index.html'),
    },
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
    strictPort: true,
  },
});
