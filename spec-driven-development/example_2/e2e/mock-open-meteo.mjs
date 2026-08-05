import http from 'node:http';

const PORT = 3070;
const successLocation = (city) => ({ name: city, country: 'Brasil', latitude: -23.5, longitude: -46.6, admin1: 'São Paulo' });
const forecast = { current: { temperature_2m: 24.3, apparent_temperature: 25.1, weather_code: 2, relative_humidity_2m: 72, wind_speed_10m: 12.4 }, current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' } };

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/health') return send(response, 200, { status: 'ok' });
  if (url.pathname.endsWith('/search')) return geocoding(url, response);
  if (url.pathname.endsWith('/forecast')) return send(response, 200, forecast);
  return send(response, 404, { error: 'not found' });
});

function geocoding(url, response) {
  const city = url.searchParams.get('name') ?? '';
  if (city.toLowerCase() === 'atlantis') return send(response, 200, { results: [] });
  if (city.toLowerCase() === 'indisponivel') return send(response, 503, { error: 'unavailable' });
  if (city.toLowerCase() === 'lento') return setTimeout(() => send(response, 200, { results: [successLocation(city)] }), 700);
  return send(response, 200, { results: [successLocation(city), successLocation('Segundo resultado')] });
}

server.listen(PORT, '127.0.0.1');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
