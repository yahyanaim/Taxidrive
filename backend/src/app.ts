import cors from 'cors';
import express from 'express';

export type AppConfig = {
  corsOrigin: string;
};

export function createApp(config: AppConfig) {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}
