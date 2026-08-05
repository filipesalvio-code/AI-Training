import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocationAutocomplete } from './LocationAutocomplete';
import type { LocationSearchState } from '../types/location-search-state';
import { LanguageProvider } from './LanguageProvider';

const suggestions = [
  { city: 'Springfield', administrativeArea: 'Illinois', country: 'Estados Unidos', coordinates: { latitude: 39.8, longitude: -89.6 } },
  { city: 'Springfield', administrativeArea: 'Massachusetts', country: 'Estados Unidos', coordinates: { latitude: 42.1, longitude: -72.6 } },
];

const successState: LocationSearchState = { status: 'success', query: 'Springfield', suggestions };

afterEach(() => cleanup());

function renderAutocomplete(state: LocationSearchState = successState) {
  return render(<LanguageProvider><LocationAutocomplete value="Springfield" state={state} onValueChange={vi.fn()} onSelect={vi.fn()} onDismiss={vi.fn()} /></LanguageProvider>);
}

describe('LocationAutocomplete', () => {
  it('exposes combobox semantics, labels and active option state', async () => {
    const user = userEvent.setup();
    renderAutocomplete();
    const input = screen.getByRole('combobox', { name: 'Nome da cidade' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'location-suggestions-option-1');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('selects the active option by keyboard and dismisses with Escape', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onDismiss = vi.fn();
    render(<LanguageProvider><LocationAutocomplete value="Springfield" state={successState} onValueChange={vi.fn()} onSelect={onSelect} onDismiss={onDismiss} /></LanguageProvider>);
    const input = screen.getByRole('combobox', { name: 'Nome da cidade' });
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(suggestions[0]);
    await user.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('selects a pointer option and announces empty and error states', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<LanguageProvider><LocationAutocomplete value="Springfield" state={successState} onValueChange={vi.fn()} onSelect={onSelect} onDismiss={vi.fn()} /></LanguageProvider>);
    await user.click(screen.getByRole('option', { name: /Massachusetts/ }));
    expect(onSelect).toHaveBeenCalledWith(suggestions[1]);
    cleanup();
    renderAutocomplete({ status: 'success', query: 'zz', suggestions: [] });
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma localidade encontrada');
    cleanup();
    renderAutocomplete({ status: 'error', query: 'zz', error: { code: 'LOCATION_SERVICE_UNAVAILABLE', message: 'Serviço indisponível' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível buscar localidades');
  });

  it('closes after focus leaves the interaction and handles an empty list', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<LanguageProvider><LocationAutocomplete value="Springfield" state={successState} onValueChange={vi.fn()} onSelect={vi.fn()} onDismiss={onDismiss} /></LanguageProvider>);
    const input = screen.getByRole('combobox', { name: 'Nome da cidade' });
    fireEvent.blur(input, { relatedTarget: document.body });
    expect(onDismiss).toHaveBeenCalled();
    cleanup();
    renderAutocomplete({ status: 'success', query: 'zz', suggestions: [] });
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma localidade encontrada');
  });
});
