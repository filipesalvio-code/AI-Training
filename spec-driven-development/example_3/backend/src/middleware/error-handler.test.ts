import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors/app-error';
import { errorHandler } from './error-handler';

function makeResponse(): { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; locals: { requestId: string } } {
  const response = { status: vi.fn(), json: vi.fn(), locals: { requestId: 'request-1' } };
  response.status.mockReturnValue(response);
  return response;
}

describe('errorHandler', () => {
  it('serializes expected application errors', () => {
    const response = makeResponse();
    errorHandler(new AppError('INVALID_LOCATION_QUERY', 400), {} as never, response as never, vi.fn());
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ error: { code: 'INVALID_LOCATION_QUERY', message: 'Informe ao menos dois caracteres para buscar uma localidade.' } });
  });

  it('hides unexpected error details and logs a sanitized cause', () => {
    const response = makeResponse();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    errorHandler(new Error('secret detail'), {} as never, response as never, vi.fn());
    errorSpy.mockRestore();
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro inesperado. Tente novamente.' } });
  });
});
