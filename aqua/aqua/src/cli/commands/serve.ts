import http from 'http';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ServeOptions {
  port?: string;
  host?: string;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function getMimeType(filePath: string): string {
  return MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
}

function findDashboardDist(): string | null {
  const candidates = [
    path.resolve(__dirname, '../../dashboard/dist'),
    path.resolve(process.cwd(), 'aqua/dashboard/dist'),
    path.resolve(process.cwd(), 'dashboard/dist'),
    path.resolve(process.cwd(), '../aqua/dashboard/dist'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'index.html'))) return c;
  }
  return null;
}

export async function serveCommand(options: ServeOptions): Promise<void> {
  const port = parseInt(options.port || '3000', 10);
  const host = options.host || 'localhost';

  logger.header('Starting AQUA Dashboard');

  const distDir = findDashboardDist();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}:${port}`);

    // API routes
    if (url.pathname.startsWith('/api/config')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.writeHead(204);
        res.end();
        return;
      }

      const configPath = path.resolve(process.cwd(), 'aqua.config.json');

      if (req.method === 'GET') {
        try {
          if (fs.existsSync(configPath)) {
            const config = await fs.readJson(configPath);
            res.writeHead(200);
            res.end(JSON.stringify(config));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ projectName: 'aqua-project', version: '0.1.0', agents: [], skills: [], tools: [] }));
          }
        } catch {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to read config' }));
        }
        return;
      }

      if (req.method === 'PUT') {
        try {
          const body = await readBody(req);
          const config = JSON.parse(body);
          await fs.writeJson(configPath, config, { spaces: 2 });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to write config' }));
        }
        return;
      }

      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    // Static file serving
    if (!distDir) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getFallbackHtml(port));
      return;
    }

    let filePath = path.join(distDir, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!path.extname(filePath)) filePath += '.html';

    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const content = await fs.readFile(filePath);
        res.setHeader('Content-Type', getMimeType(filePath));
        res.writeHead(200);
        res.end(content);
      } else {
        // SPA fallback
        const indexHtml = await fs.readFile(path.join(distDir, 'index.html'));
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(indexHtml);
      }
    } catch {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });

  return new Promise((_resolve) => {
    server.listen(port, host, () => {
      logger.info(`Server running at:`);
      logger.bullet(`http://${host}:${port}`);
      if (host !== 'localhost') {
        logger.bullet(`http://localhost:${port}`);
      }
      if (!distDir) {
        logger.warn('\nDashboard not built. Run "pnpm build" first, or use:');
        logger.bullet('pnpm --filter @aqua/dashboard dev');
        logger.info('\nThe server is running with a fallback page.');
      }
      logger.info(`\nPress ${chalk.cyan('Ctrl+C')} to stop`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use.`);
        process.exit(1);
      }
      throw err;
    });
  });
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getFallbackHtml(port: number): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AQUA Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e1e4e8; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; padding: 48px; max-width: 480px; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #58a6ff; }
    .subtitle { color: #8b949e; font-size: 14px; margin-bottom: 32px; }
    .info { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left; }
    .info p { font-size: 13px; color: #8b949e; margin-bottom: 4px; }
    code { background: #21262d; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #58a6ff; }
  </style>
</head>
<body>
  <div class="card">
    <h1>AQUA</h1>
    <p class="subtitle">Agent Application Workbench</p>
    <div class="info">
      <p>Dashboard not yet built. Run:</p>
      <p style="margin-top:8px"><code>pnpm --filter @aqua/dashboard dev</code></p>
      <p style="margin-top:4px">or</p>
      <p style="margin-top:4px"><code>pnpm build</code> then restart <code>aqua serve</code></p>
    </div>
    <p style="font-size:12px;color:#484f58">Server running on port ${port}</p>
  </div>
</body>
</html>`;
}