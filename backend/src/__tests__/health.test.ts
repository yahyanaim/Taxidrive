import request from 'supertest';
import { createApp } from '../app';

describe('GET /health', () => {
  it('returns ok', async () => {
    const app = createApp({ corsOrigin: 'http://localhost:5173' });

    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
