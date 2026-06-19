import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function createVercelResponse(res: ServerResponse) {
  let statusCode = 200;

  const vercelRes = {
    status(code: number) {
      statusCode = code;
      return vercelRes;
    },
    json(data: unknown) {
      if (!res.headersSent) {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      }
      return vercelRes;
    },
    send(data: string) {
      if (!res.headersSent) {
        res.statusCode = statusCode;
        res.end(data);
      }
      return vercelRes;
    },
  };

  return vercelRes;
}

async function runHandler(
  server: ViteDevServer,
  modulePath: string,
  req: IncomingMessage,
  res: ServerResponse
) {
  const mod = await server.ssrLoadModule(modulePath);
  const handler = mod.default;
  const body = await readBody(req);
  const vercelReq = req as IncomingMessage & { body?: unknown };
  vercelReq.body = body;
  await handler(vercelReq, createVercelResponse(res));
}

export function apiPlugin(): Plugin {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';

        if (url === '/api/createLesson' && req.method === 'POST') {
          try {
            await runHandler(server, '/api/createLesson.ts', req, res);
          } catch (err) {
            console.error('createLesson error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: String(err) }));
            }
          }
          return;
        }

        if (url === '/api/generateContent' && req.method === 'POST') {
          try {
            await runHandler(server, '/api/generateContent.ts', req, res);
          } catch (err) {
            console.error('generateContent error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: String(err) }));
            }
          }
          return;
        }

        next();
      });
    },
  };
}
