import { LanguageToggle } from './LanguageToggle';

type WeatherHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function WeatherHeader({ eyebrow, title, subtitle }: WeatherHeaderProps) {
  return <header className="max-w-2xl">
    <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
    <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">{title}</h1>
    <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">{subtitle}</p>
    <LanguageToggle />
  </header>;
}
