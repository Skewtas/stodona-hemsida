import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin, type ViteDevServer} from 'vite';

/**
 * Lokal testmiljö för chatten. Vite kör inte Vercels funktioner, så i dev
 * kopplar den här pluginen /api/chat direkt till api/chat.ts. Den gäller bara
 * `vite` (dev) – aldrig `vite build` – och påverkar alltså inte produktion.
 *
 * STODONA_LOKAL=true får api/chat.ts att hålla samtalet i minnet och att
 * logga lead i terminalen i stället för att mejla kundservice.
 */
function lokalChatApi(env: Record<string, string>): Plugin {
  return {
    name: 'stodona-lokal-chat-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      for (const [nyckel, varde] of Object.entries(env)) {
        if (!(nyckel in process.env)) process.env[nyckel] = varde;
      }
      process.env.STODONA_LOKAL = 'true';
      process.env.CHAT_ENABLED = 'true';

      server.config.logger.info(
        `[lokal chat] ${Object.keys(env).length} env-variabler lästa · ` +
          `ANTHROPIC_API_KEY i .env: ${Boolean(env.ANTHROPIC_API_KEY)} · ` +
          `i process.env: ${Boolean(process.env.ANTHROPIC_API_KEY)}`,
      );

      server.middlewares.use('/api/', async (req, res, next) => {
        // /api/chat → api/chat.ts. Chatten anropar även /api/calculate-price,
        // så alla endpoints behöver finnas i testmiljön.
        const rutt = (req.url ?? '').split('?')[0].replace(/^\/+|\/+$/g, '');
        if (!/^[a-z0-9-]+$/i.test(rutt)) return next();
        try {
          const modul = await server.ssrLoadModule(`/api/${rutt}.ts`);

          const bitar: Buffer[] = [];
          for await (const bit of req) bitar.push(bit as Buffer);

          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === 'string') headers.set(k, v);
            else if (Array.isArray(v)) headers.set(k, v.join(', '));
          }

          const url = `http://${req.headers.host}${req.originalUrl ?? req.url ?? '/api/chat'}`;
          const request = new Request(url, {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(bitar),
          });

          // Edge-funktioner exporterar en funktion, Node-funktioner ett { fetch }.
          const kor = typeof modul.default === 'function' ? modul.default : modul.default?.fetch;
          if (typeof kor !== 'function') return next();
          const svar: Response = await kor(request);
          res.statusCode = svar.status;
          svar.headers.forEach((v, k) => res.setHeader(k, v));
          if (svar.body) {
            const lasare = svar.body.getReader();
            for (;;) {
              const {done, value} = await lasare.read();
              if (done) break;
              res.write(value);
            }
          }
          res.end();
        } catch (fel) {
          server.config.logger.error(`[lokal chat] ${fel instanceof Error ? fel.stack : String(fel)}`);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({error: 'Lokalt fel i /api/chat – se terminalen.'}));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss(), lokalChatApi(env)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
