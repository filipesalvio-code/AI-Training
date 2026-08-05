import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchLocations } from './location-service';

const suggestions = [{ city: 'Springfield', administrativeArea: 'Illinois', country: 'Estados Unidos', coordinates: { latitude: 39.8, longitude: -89.6 } }];

afterEach(() => vi.restoreAllMocks());

describe('searchLocations', () => {
  it('calls the backend locations endpoint and parses suggestions', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ suggestions }), { status: 200 }));
    await expect(searchLocations('Springfield', new AbortController().signal)).resolves.toEqual(suggestions);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/locations?query=Springfield');
  });

  it('normalizes errors, malformed payloads and network failures', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'LOCATION_SERVICE_UNAVAILABLE', message: 'internal' } }), { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'toString' } }), { status: 503 }));
    const signal = new AbortController().signal;
    await expect(searchLocations('Springfield', signal)).rejects.toMatchObject({ apiError: { code: 'LOCATION_SERVICE_UNAVAILABLE' } });
    await expect(searchLocations('Springfield', signal)).rejects.toMatchObject({ apiError: { code: 'LOCATION_SERVICE_UNAVAILABLE' } });
    await expect(searchLocations('Springfield', signal)).rejects.toMatchObject({ apiError: { code: 'LOCATION_SERVICE_UNAVAILABLE' } });
    await expect(searchLocations('Springfield', signal)).rejects.toMatchObject({ apiError: { code: 'LOCATION_SERVICE_UNAVAILABLE' } });
  });

  it('rejects suggestions with coordinates outside WGS84 bounds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ suggestions: [{ ...suggestions[0], coordinates: { latitude: 91, longitude: -89.6 } }] }), { status: 200 }));
    await expect(searchLocations('Springfield', new AbortController().signal)).rejects.toMatchObject({ apiError: { code: 'LOCATION_SERVICE_UNAVAILABLE' } });
  });
});
