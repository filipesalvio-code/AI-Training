import { createServer } from 'node:http'

const PORT = 3050
const responses = new Map()

function readCity(requestUrl) {
  return new URL(requestUrl, `http://127.0.0.1:${PORT}`).searchParams.get('name') ?? ''
}

function isUnavailableCity(city) {
  return city === 'Retry City' && (responses.get(city) ?? 0) === 0
}

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

function writeGeocoding(response, city) {
  if (city === 'Atlantis') {
    writeJson(response, 200, { results: [] })
    return
  }
  if (isUnavailableCity(city)) {
    responses.set(city, 1)
    writeJson(response, 503, { reason: 'controlled outage' })
    return
  }
  writeJson(response, 200, {
    results: [{ name: city, admin1: 'Região de teste', country: 'Brasil', latitude: -23.55, longitude: -46.63 }],
  })
}

function writeForecast(response) {
  writeJson(response, 200, {
    current: {
      temperature_2m: 24.3,
      apparent_temperature: 25.1,
      weather_code: 2,
      relative_humidity_2m: 72,
      wind_speed_10m: 12.4,
    },
    current_units: {
      temperature_2m: '°C',
      apparent_temperature: '°C',
      relative_humidity_2m: '%',
      wind_speed_10m: 'km/h',
    },
  })
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`)
  if (requestUrl.pathname === '/v1/search') {
    const city = readCity(request.url ?? '/')
    const delay = city === 'Delayed City' ? 700 : 0
    setTimeout(() => writeGeocoding(response, city), delay)
    return
  }
  if (requestUrl.pathname === '/v1/forecast') {
    writeForecast(response)
    return
  }
  writeJson(response, 404, { reason: 'not found' })
})

server.listen(PORT, '127.0.0.1')

function shutdown() {
  server.close(() => process.exit(0))
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
