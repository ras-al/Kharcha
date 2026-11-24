import { Monitor, Moon, Sun } from '@phosphor-icons/react';
import { usePreferences } from '../context/ThemeContext';

function Choice({ legend, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-control bg-sunk p-1">
        {options.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-segment min-h-[60px] px-1 text-[13px] font-bold transition-colors duration-150
              ${value === id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
          >
            <Icon size={20} weight={value === id ? 'fill' : 'bold'} aria-hidden="true" />{label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Theme choice. Saved to the account. */
export default function Preferences() {
  const { theme, setTheme } = usePreferences();
  return (
    <div className="space-y-6">
      <Choice legend="Theme" value={theme} onChange={setTheme} options={[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'Auto', Monitor]]} />
      <p className="text-sm text-muted -mt-3">Auto follows your device's dark mode setting.</p>
    </div>
  );
}
