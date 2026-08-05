import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

const weatherDescriptions: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas leves',
  81: 'Pancadas moderadas',
  82: 'Pancadas fortes',
  95: 'Trovoadas',
  96: 'Trovoadas com granizo',
  99: 'Trovoadas fortes com granizo',
};

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
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';

  if (!city) {
    res.status(400).json({ error: 'Informe uma cidade para consultar o clima.' });
    return;
  }

  try {
    const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geocodingUrl.searchParams.set('name', city);
    geocodingUrl.searchParams.set('count', '1');
    geocodingUrl.searchParams.set('language', 'pt');
    geocodingUrl.searchParams.set('format', 'json');

    const geocodingResponse = await fetch(geocodingUrl);
    if (!geocodingResponse.ok) throw new Error('Não foi possível localizar a cidade.');

    const geocodingData = await geocodingResponse.json() as { results?: GeocodingResult[] };
    const location = geocodingData.results?.[0];

    if (!location) {
      res.status(404).json({ error: 'Cidade não encontrada. Tente informar também o país ou estado.' });
      return;
    }

    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.searchParams.set('latitude', String(location.latitude));
    weatherUrl.searchParams.set('longitude', String(location.longitude));
    weatherUrl.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m');
    weatherUrl.searchParams.set('timezone', 'auto');

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error('Não foi possível obter as condições meteorológicas.');

    const weatherData = await weatherResponse.json() as {
      current: {
        time: string;
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
      };
    };

    res.json({
      location: {
        name: location.name,
        region: location.admin1,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      current: {
        ...weatherData.current,
        description: weatherDescriptions[weatherData.current.weather_code] ?? 'Condição desconhecida',
      },
    });
  } catch (error) {
    console.error('Weather lookup failed:', error);
    res.status(502).json({ error: 'Não foi possível consultar o serviço de clima. Tente novamente.' });
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
