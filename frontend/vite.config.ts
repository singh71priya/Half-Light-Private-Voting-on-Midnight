/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

// Same config as Signet (github.com/anshusingh97/Signet) which successfully
// runs real on-chain Midnight transactions with 1AM wallet.
// vite-plugin-wasm is required for @midnight-ntwrk WASM ZK circuit bundles.
export default defineConfig({
  plugins: [react(), wasm()],
  build: {
    target: 'esnext', // Required for top-level await in WASM modules
  },
  optimizeDeps: {
    // Prevent Vite from pre-bundling WASM modules (they must load natively)
    exclude: [
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
      '@midnight-ntwrk/midnight-js-level-private-state-provider',
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'html'],
      provider: 'v8',
    },
  },
});
