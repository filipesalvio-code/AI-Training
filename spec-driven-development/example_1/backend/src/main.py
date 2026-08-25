from dotenv import load_dotenv

from src.app import AppOptions, create_app
from src.config.environment import load_environment

load_dotenv()
_config = load_environment()
app = create_app(
    AppOptions(
        cors_origin=_config.cors_origin,
        weather_timeout_ms=_config.open_meteo_timeout_ms,
        geocoding_url=_config.open_meteo_geocoding_url,
        forecast_url=_config.open_meteo_forecast_url,
    )
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=_config.port, reload=True)
