import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CityNotFoundError, getWeatherByCity, getWeatherByCoordinates } from './weather';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/weather', async (req: Request, res: Response) => {
  const { city, latitude, longitude } = req.query;

  try {
    if (typeof latitude === 'string' && typeof longitude === 'string') {
      const lat = Number(latitude);
      const lon = Number(longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        res.status(400).json({ error: 'Invalid latitude or longitude' });
        return;
      }
      const weather = await getWeatherByCoordinates(lat, lon);
      res.json(weather);
      return;
    }

    if (typeof city !== 'string' || city.trim().length === 0) {
      res.status(400).json({ error: 'Query parameter "city" is required' });
      return;
    }

    const weather = await getWeatherByCity(city.trim());
    res.json(weather);
  } catch (error) {
    if (error instanceof CityNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(502).json({ error: 'Failed to fetch weather data' });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});