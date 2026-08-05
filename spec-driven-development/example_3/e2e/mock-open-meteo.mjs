import http from 'node:http';

const PORT = Number(process.env.MOCK_PORT ?? 3070);
const forecast = { current: { temperature_2m: 24.3, apparent_temperature: 25.1, weather_code: 2, relative_humidity_2m: 72, wind_speed_10m: 12.4 }, current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' } };

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

function createLocation(city, country, countryCode, region, latitude, longitude) {
  return { name: city, country, country_code: countryCode, latitude, longitude, ...(region ? { admin1: region } : {}) };
}

function getLocations(city) {
  const normalized = city.toLowerCase();
  if (normalized === 'springfield') return [
    createLocation('Springfield', 'Estados Unidos', 'US', 'Illinois', 39.8, -89.6),
    createLocation('Springfield', 'Estados Unidos', 'US', 'Massachusetts', 42.1, -72.6),
  ];
  if (normalized === 'lisboa' || normalized === 'porto') return [createLocation(city, 'Portugal', 'PT', null, 38.7, -9.1)];
  return [createLocation(city, 'Brasil', 'BR', 'São Paulo', -23.5, -46.6), createLocation(`${city} Centro`, 'Brasil', 'BR', 'São Paulo', -23.6, -46.7)];
}

function geocoding(url, response) {
  const city = url.searchParams.get('name') ?? '';
  const normalized = city.toLowerCase();
  if (normalized === 'atlantis' || normalized === 'zzzzzz') return send(response, 200, { results: [] });
  if (normalized === 'indisponivel') return send(response, 503, { error: 'unavailable' });
  if (normalized === 'velho' || normalized === 'lento') return setTimeout(() => send(response, 200, { results: getLocations(city) }), 700);
  return send(response, 200, { results: getLocations(city) });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/health') return send(response, 200, { status: 'ok' });
  if (url.pathname.endsWith('/search')) return geocoding(url, response);
  if (url.pathname.endsWith('/forecast')) return send(response, 200, forecast);
  return send(response, 404, { error: 'not found' });
});

server.listen(PORT, '127.0.0.1');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
