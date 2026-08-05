import { useCallback, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import type { LocationSuggestion } from '../types/location-suggestion';

export const LOCATION_LISTBOX_ID = 'location-suggestions';

type ComboboxNavigation = {
  activeIndex: number;
  reset: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handlePointerDown: (index: number, event: PointerEvent<HTMLLIElement>) => void;
};

export function useComboboxNavigation(suggestions: LocationSuggestion[], onSelect: (suggestion: LocationSuggestion) => void, onDismiss: () => void): ComboboxNavigation {
  const [activeIndex, setActiveIndex] = useState(-1);
  const reset = useCallback((): void => setActiveIndex(-1), []);
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => suggestions.length ? (index + 1) % suggestions.length : -1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => suggestions.length ? (index <= 0 ? suggestions.length - 1 : index - 1) : -1);
      return;
    }
    if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < suggestions.length) {
      event.preventDefault();
      onSelect(suggestions[activeIndex]);
      reset();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      reset();
      onDismiss();
    }
  }, [activeIndex, onDismiss, onSelect, reset, suggestions]);
  const handlePointerDown = useCallback((index: number, event: PointerEvent<HTMLLIElement>): void => {
    event.preventDefault();
    onSelect(suggestions[index]);
    reset();
  }, [onSelect, reset, suggestions]);
  return { activeIndex, reset, handleKeyDown, handlePointerDown };
}
