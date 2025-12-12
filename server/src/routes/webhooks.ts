import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Webhook endpoints are handled in middleware/stripeWebhook.ts
// This file can be used for other webhook types if needed

router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoints are working',
    endpoints: {
      stripe: '/webhooks/stripe',
    },
  });
}));

// Health check for webhooks
router.get('/health', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}));

export default router;