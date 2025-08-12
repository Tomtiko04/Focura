import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import { createServer } from 'http';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function start() {
  await connectToDatabase();
  const httpServer = createServer(app);
  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] Server listening on port ${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[backend] Failed to start server:', error);
  process.exit(1);
});


