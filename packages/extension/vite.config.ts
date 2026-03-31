import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirOnBuild: true,
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: {
        'popup/popup': resolve(__dirname, 'src/popup/popup.html'),
        'content/content': resolve(__dirname, 'src/content/content.ts'),
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? '';
          if (name === 'popup.css') return 'popup/popup.css';
          if (name === 'content.css') return 'content/content.css';
          return 'assets/[name].[ext]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'copy-extension-files',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist');

        // Vite puts popup.html at dist/src/popup/popup.html because the input is src/popup/popup.html
        // Move it to dist/popup/popup.html where the manifest expects it
        const wrongPath = resolve(distDir, 'src', 'popup', 'popup.html');
        const correctPath = resolve(distDir, 'popup', 'popup.html');
        if (existsSync(wrongPath)) {
          if (!existsSync(resolve(distDir, 'popup'))) {
            mkdirSync(resolve(distDir, 'popup'), { recursive: true });
          }
          copyFileSync(wrongPath, correctPath);
        }

        // Clean up dist/src if it exists
        const srcDir = resolve(distDir, 'src');
        if (existsSync(srcDir)) {
          try {
            const { rmSync } = require('fs');
            rmSync(srcDir, { recursive: true });
          } catch {
            /* ignore cleanup errors */
          }
        }

        // Copy manifest.json
        copyFileSync(resolve(__dirname, 'src/manifest.json'), resolve(distDir, 'manifest.json'));

        // Copy content.css (standalone file referenced by manifest.json)
        const contentCssDir = resolve(distDir, 'content');
        if (!existsSync(contentCssDir)) {
          mkdirSync(contentCssDir, { recursive: true });
        }
        copyFileSync(
          resolve(__dirname, 'src/content/content.css'),
          resolve(contentCssDir, 'content.css'),
        );

        // Copy icons
        const srcIcons = resolve(__dirname, 'public/icons');
        const distIcons = resolve(distDir, 'icons');
        if (!existsSync(distIcons)) {
          mkdirSync(distIcons, { recursive: true });
        }
        if (existsSync(srcIcons)) {
          for (const file of readdirSync(srcIcons)) {
            copyFileSync(resolve(srcIcons, file), resolve(distIcons, file));
          }
        }
      },
    },
  ],
});
