import { app } from './app.js';
import { logger } from './lib/logger.js';

const PORT = 4000;

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});
