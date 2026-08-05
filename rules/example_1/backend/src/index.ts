import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

type GeocodingResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type WeatherResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
};

app.get('/weather', async (req: Request, res: Response) => {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';

  if (!city) {
    res.status(400).json({ error: 'Informe uma cidade para consultar o clima.' });
    return;
  }

  if (city.length > 100) {
    res.status(400).json({ error: 'O nome da cidade deve ter no máximo 100 caracteres.' });
    return;
  }

  try {
    const geocodingUrl = new URL(GEOCODING_URL);
    geocodingUrl.searchParams.set('name', city);
    geocodingUrl.searchParams.set('count', '1');
    geocodingUrl.searchParams.set('language', 'pt');
    geocodingUrl.searchParams.set('format', 'json');

    const geocodingResponse = await fetch(geocodingUrl);
    if (!geocodingResponse.ok) {
      throw new Error('Não foi possível consultar a localização.');
    }

    const geocodingData = await geocodingResponse.json() as GeocodingResponse;
    const location = geocodingData.results?.[0];

    if (!location) {
      res.status(404).json({ error: `Não encontramos a cidade “${city}”.` });
      return;
    }

    const weatherUrl = new URL(WEATHER_URL);
    weatherUrl.searchParams.set('latitude', String(location.latitude));
    weatherUrl.searchParams.set('longitude', String(location.longitude));
    weatherUrl.searchParams.set('current', [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','));
    weatherUrl.searchParams.set('timezone', 'auto');

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error('Não foi possível consultar o clima.');
    }

    const weatherData = await weatherResponse.json() as WeatherResponse;

    res.json({
      location: {
        name: location.name,
        region: location.admin1,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      timezone: weatherData.timezone,
      current: weatherData.current,
    });
  } catch (error) {
    console.error('Weather request failed:', error);
    res.status(502).json({ error: 'O serviço de clima está indisponível no momento.' });
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
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
