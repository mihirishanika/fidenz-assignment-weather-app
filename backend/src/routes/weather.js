import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { fetchAllWeather, fetchWeatherById, getCityIds } from '../services/weatherService.js';

const router = Router();

router.use(authenticate);

// Get list of city IDs
router.get('/cities', async (_req, res, next) => {
  try {
    const ids = await getCityIds();
    res.json({ ids });
  } catch (e) { next(e); }
});

// Get weather for all known cities (cached 5 min)
router.get('/', async (_req, res, next) => {
  try {
    const data = await fetchAllWeather();
    res.json(data);
  } catch (e) { next(e); }
});

// Get weather by specific id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await fetchWeatherById(req.params.id);
    res.json(data);
  } catch (e) { next(e); }
});

export default router;
