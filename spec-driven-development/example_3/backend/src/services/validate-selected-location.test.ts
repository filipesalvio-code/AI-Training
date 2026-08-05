import { describe, expect, it } from 'vitest';
import { validateSelectedLocation } from './validate-selected-location';

const validLocation = {
  city: ' Springfield ',
  administrativeArea: null,
  country: ' Estados Unidos ',
  coordinates: { latitude: 39.8, longitude: -89.6 },
};

describe('validateSelectedLocation', () => {
  it('accepts valid labels, nullable area and WGS84 coordinates', () => {
    expect(validateSelectedLocation(validLocation)).toEqual({
      city: 'Springfield',
      administrativeArea: null,
      country: 'Estados Unidos',
      coordinates: { latitude: 39.8, longitude: -89.6 },
    });
  });

  it('rejects missing labels, invalid area and out-of-range coordinates', () => {
    expect(() => validateSelectedLocation({ ...validLocation, city: '' })).toThrow('Selecione uma localidade válida.');
    expect(() => validateSelectedLocation({ ...validLocation, administrativeArea: '' })).toThrow('Selecione uma localidade válida.');
    expect(() => validateSelectedLocation({ ...validLocation, coordinates: { latitude: 91, longitude: -89.6 } })).toThrow('Selecione uma localidade válida.');
    expect(() => validateSelectedLocation({ ...validLocation, coordinates: { latitude: 39.8, longitude: -181 } })).toThrow('Selecione uma localidade válida.');
  });
});
