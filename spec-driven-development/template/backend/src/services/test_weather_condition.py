from __future__ import annotations

import pytest

from src.errors import AppError
from src.services.weather_condition import get_weather_condition, is_known_weather_code


def test_known_weather_code_maps_to_english():
    assert get_weather_condition(2) == "Partly cloudy"
    assert is_known_weather_code(2) is True


def test_unknown_weather_code_fails_closed():
    with pytest.raises(AppError) as error:
        get_weather_condition(999)
    assert error.value.code == "WEATHER_SERVICE_UNAVAILABLE"
