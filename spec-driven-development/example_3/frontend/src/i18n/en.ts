import type { Translations } from '../types/translations';

export const en: Translations = {
  'header.eyebrow': 'WEATHER PANEL', 'header.title': 'Weather right now', 'header.subtitle': 'Check current conditions for any city and see the resolved location in an instant.',
  'search.sectionLabel': 'Weather search', 'search.cityLabel': 'City name', 'search.cityPlaceholder': 'E.g. São Paulo', 'search.submit': 'Check weather', 'search.submitting': 'Checking…',
  'feedback.loading': 'Fetching current conditions…', 'feedback.retryHint': 'Check the location and try again.', 'feedback.locationLoading': 'Searching locations…', 'feedback.locationEmpty': 'No locations found.', 'search.suggestionsLabel': 'Location suggestions', 'search.selectedSuggestion': 'Selected',
  'error.INVALID_CITY': 'Enter a city with at least two characters.', 'error.INVALID_LOCATION_QUERY': 'Enter at least two characters to search for a location.', 'error.LOCATION_SERVICE_UNAVAILABLE': 'We could not search locations right now. Try again.', 'error.INVALID_LOCATION': 'Select a valid location.',
  'error.CITY_NOT_FOUND': 'City not found. Check the name and try again.', 'error.WEATHER_SERVICE_UNAVAILABLE': 'We could not check the weather right now. Try again shortly.', 'error.INTERNAL_ERROR': 'An unexpected error occurred. Try again.',
  'result.resolvedLocation': 'Resolved location', 'result.apparentTemperature': 'Feels like', 'result.relativeHumidity': 'Relative humidity', 'result.windSpeed': 'Wind speed', 'result.condition': 'Current condition',
  'source.dataBy': 'Data by', 'source.licensedUnder': ', licensed under', 'footer.note': 'Updated on demand · no search history', 'document.title': 'Weather right now', 'language.toggleText': 'EN → PT', 'language.toggleLabel': 'Current language: English. Switch to Portuguese.',
};
