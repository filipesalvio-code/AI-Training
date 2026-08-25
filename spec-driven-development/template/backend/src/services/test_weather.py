from __future__ import annotations

import pytest

from src.errors import AppError
from src.services.weather import normalize_city


def test_normalize_city_trims_and_collapses_spaces():
    assert normalize_city("  São   Paulo  ") == "São Paulo"


@pytest.mark.parametrize("value", ["", " ", "a", "  a  "])
def test_normalize_city_rejects_short_or_blank(value: str):
    with pytest.raises(AppError) as error:
        normalize_city(value)
    assert error.value.code == "INVALID_CITY"


def test_normalize_city_rejects_non_string():
    with pytest.raises(AppError) as error:
        normalize_city(None)
    assert error.value.code == "INVALID_CITY"
