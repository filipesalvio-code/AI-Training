Implement a weather panel on the existing frontend and backend.

The user must be able to type a city and see the current weather.

To fetch data, use the Open-Meteo API (free, no API key):

- Geocoding API: https://geocoding-api.open-meteo.com/v1/search (convert city to coordinates)
- Weather API: https://api.open-meteo.com/v1/forecast (fetch weather data)

The frontend must fetch data only from the backend. Optionally, the frontend may try to get the user's location via the browser (geolocation) and suggest the city automatically.

Create a backend endpoint for the frontend to consume and display the data in the panel.
