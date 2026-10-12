import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'react-page-route-fallback',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const requestUrl = new URL(request.url || '/', 'http://localhost');
        const pathname = requestUrl.pathname;
        if (pathname.endsWith('.html') && pathname !== '/index.html'
            && !requestUrl.searchParams.has('import') && !requestUrl.searchParams.has('raw')) {
          request.url = '/index.html';
        }
        next();
      });
    }
  }],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
