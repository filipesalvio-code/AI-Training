import type { PointerEvent } from 'react';
import type { LocationSuggestion } from '../types/location-suggestion';
import { LOCATION_LISTBOX_ID } from '../hooks/useComboboxNavigation';
import { useTranslation } from '../hooks/useTranslation';

type LocationSuggestionsListProps = {
  suggestions: LocationSuggestion[];
  activeIndex: number;
  onPointerDown: (index: number, event: PointerEvent<HTMLLIElement>) => void;
};

function getSuggestionKey(suggestion: LocationSuggestion): string {
  const { city, administrativeArea, country, coordinates } = suggestion;
  return `${city}-${administrativeArea ?? ''}-${country}-${coordinates.latitude}-${coordinates.longitude}`;
}

export function LocationSuggestionsList({ suggestions, activeIndex, onPointerDown }: LocationSuggestionsListProps) {
  const { t } = useTranslation();
  return <ul id={LOCATION_LISTBOX_ID} className="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-sm border border-slate-700 bg-slate-900 p-1 shadow-xl" role="listbox" aria-label={t('search.suggestionsLabel')}>
    {suggestions.map((suggestion, index) => <li key={getSuggestionKey(suggestion)} role="option" aria-selected={index === activeIndex} id={`${LOCATION_LISTBOX_ID}-option-${index}`} className={`flex min-h-14 w-full cursor-pointer items-start justify-between gap-3 rounded-sm px-3 py-3 text-left ${index === activeIndex ? 'border-l-4 border-amber-300 bg-slate-800' : 'border-l-4 border-transparent hover:bg-slate-800'}`} onPointerDown={(event) => onPointerDown(index, event)}>
      <span className="min-w-0"><span className="block break-words font-medium text-white">{suggestion.city}</span><span className="block break-words text-sm text-slate-300">{suggestion.administrativeArea ? `${suggestion.administrativeArea} · ` : ''}{suggestion.country}</span></span>
      {index === activeIndex ? <span className="shrink-0 text-xs text-amber-200">{t('search.selectedSuggestion')}</span> : null}
    </li>)}
  </ul>;
}
