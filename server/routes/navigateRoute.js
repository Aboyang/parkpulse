import { Router } from 'express';
import { NavigateService } from '../services/navigateService.js';

const router = Router();
const navigateService = new NavigateService();

/**
 * POST /api/navigate/route
 * Body: { start: [lat, lng], end: [lat, lng] }
 * Returns: { pts, steps, totalDist }
 */
router.post('/route', async (req, res) => {
  const { start, end } = req.body;

  if (
    !Array.isArray(start) || start.length !== 2 ||
    !Array.isArray(end)   || end.length   !== 2
  ) {
    return res.status(400).json({ error: 'start and end must be [lat, lng] arrays' });
  }

  try {
    const result = await navigateService.getRoute(start, end);
    return res.json(result);
  } catch (err) {
    console.error('NavigateService.getRoute error:', err);
    return res.status(500).json({ error: 'Failed to fetch route' });
  }
});

export default router;