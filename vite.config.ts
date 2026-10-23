import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

function moonstormStudioSavePlugin() {
  return {
    name: 'moonstorm-studio-save',
    configureServer(server: any) {
      server.middlewares.use('/api/save-layout', (req: any, res: any, next: any) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const officialJsonPath = path.resolve(process.cwd(), 'src/scenarios/z1s3_official_layout.json');
            fs.writeFileSync(officialJsonPath, JSON.stringify(parsed, null, 2) + '\n', 'utf-8');

            // Sync layout/z1s3.layout.json
            const layoutJsonPath = path.resolve(process.cwd(), 'layout/z1s3.layout.json');
            if (fs.existsSync(layoutJsonPath)) {
              const layoutData = JSON.parse(fs.readFileSync(layoutJsonPath, 'utf-8'));
              layoutData.studio_official_objects = parsed.objects;
              layoutData.studio_official_hotspots = parsed.hotspots;
              layoutData.studio_official_characters = parsed.characters;
              fs.writeFileSync(layoutJsonPath, JSON.stringify(layoutData, null, 2) + '\n', 'utf-8');
            }

            // Regenerate panorama shots asynchronously in the background
            const syncScript = path.resolve(process.cwd(), 'scripts/sync_official_layout.py');
            if (fs.existsSync(syncScript)) {
              exec(`python "${syncScript}"`);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, savedTo: officialJsonPath }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [moonstormStudioSavePlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'bundle',
    sourcemap: false,
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: false,
    watch: {
      ignored: [
        '**/layout/z1s3.layout.json',
        '**/review/layout_shots/**',
        '**/PLAY_SMOOTHFACE_MVP.html'
      ]
    }
  }
});
