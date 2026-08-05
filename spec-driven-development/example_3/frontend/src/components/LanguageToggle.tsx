import { useTranslation } from '../hooks/useTranslation';

export function LanguageToggle() {
  const { t, toggleLanguage } = useTranslation();
  return <button type="button" onClick={toggleLanguage} aria-label={t('language.toggleLabel')} className="mt-6 min-h-11 rounded-sm border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-slate-950">{t('language.toggleText')}</button>;
}
