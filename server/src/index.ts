import http from 'http';
import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSocket } from './sockets/io';

async function main(): Promise<void> {
  await connectDB();
  const app = createApp();
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[fatal]', err);
  process.exit(1);
});
