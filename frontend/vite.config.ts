import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import compileSCSS from './compile-scss';

export default ({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  // Set default port if not specified
  const port = parseInt(env.VITE_PORT || '5001', 10);

  return defineConfig({
    base: env.VITE_BASENAME || '/',
    plugins: [tsconfigPaths(), react(), compileSCSS()],
    build: {
      rollupOptions: {
        external: ['perf_hooks'],
        onwarn(warning, warn) {
          if (warning.code === 'EVAL') return;
          warn(warning);
        }
      }
    },
    preview: {
      port: port + 1 // Use a different port for preview
    },
    server: {
      host: '0.0.0.0',
      port: port
    }
  });
};
