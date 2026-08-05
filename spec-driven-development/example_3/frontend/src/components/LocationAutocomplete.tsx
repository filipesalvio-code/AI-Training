import type { FocusEvent, ChangeEvent } from 'react';
import { LocationSuggestionFeedback } from './LocationSuggestionFeedback';
import { LocationSuggestionsList } from './LocationSuggestionsList';
import { useComboboxNavigation, LOCATION_LISTBOX_ID } from '../hooks/useComboboxNavigation';
import { useTranslation } from '../hooks/useTranslation';
import type { LocationSearchState } from '../types/location-search-state';
import type { LocationSuggestion } from '../types/location-suggestion';

type LocationAutocompleteProps = {
  value: string;
  state: LocationSearchState;
  onValueChange: (value: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
  onDismiss: () => void;
};

function isOutsideInteraction(event: FocusEvent<HTMLDivElement>): boolean {
  return !(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget);
}

export function LocationAutocomplete({ value, state, onValueChange, onSelect, onDismiss }: LocationAutocompleteProps) {
  const { t } = useTranslation();
  const suggestions = state.status === 'success' ? state.suggestions : [];
  const navigation = useComboboxNavigation(suggestions, onSelect, onDismiss);
  const isOpen = suggestions.length > 0;
  const activeDescendant = navigation.activeIndex >= 0 ? `${LOCATION_LISTBOX_ID}-option-${navigation.activeIndex}` : undefined;
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    navigation.reset();
    onValueChange(event.target.value);
  };
  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (isOutsideInteraction(event)) onDismiss();
  };
  return <div className="max-w-xl" onBlur={handleBlur}><label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="location-search">{t('search.cityLabel')}</label><div className="relative"><input id="location-search" name="location" role="combobox" value={value} onChange={handleChange} onKeyDown={navigation.handleKeyDown} aria-autocomplete="list" aria-controls={LOCATION_LISTBOX_ID} aria-expanded={isOpen} aria-activedescendant={activeDescendant} aria-busy={state.status === 'loading'} aria-describedby={state.status === 'idle' ? undefined : 'location-feedback'} autoComplete="off" className="w-full border-b-2 border-slate-500 bg-transparent px-0 py-3 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-0" placeholder={t('search.cityPlaceholder')} />{isOpen ? <LocationSuggestionsList suggestions={suggestions} activeIndex={navigation.activeIndex} onPointerDown={navigation.handlePointerDown} /> : null}</div><LocationSuggestionFeedback state={state} /></div>;
}
