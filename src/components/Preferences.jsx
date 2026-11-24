import { Desktop, DeviceMobile, Monitor, Moon, Sun } from '@phosphor-icons/react';
import { usePreferences } from '../context/ThemeContext';

function Choice({ legend, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {options.map(([id, label, Icon]) => (
          <button key={id} type="button" role="radio" aria-checked={value === id} className="chip pl-4" onClick={() => onChange(id)}>
            <Icon size={18} weight="bold" aria-hidden="true" />{label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Theme and interface choice. Saved to the account. */
export default function Preferences() {
  const { theme, setTheme, viewMode, setViewMode } = usePreferences();
  return (
    <div className="space-y-6">
      <Choice legend="Theme" value={theme} onChange={setTheme} options={[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'Match device', Monitor]]} />
      <Choice legend="Layout" value={viewMode} onChange={setViewMode} options={[['auto', 'By screen size', Monitor], ['mobile', 'Phone', DeviceMobile], ['desktop', 'Laptop', Desktop]]} />
      <p className="text-sm text-muted -mt-3">By screen size uses the laptop layout from 1024 pixels wide.</p>
    </div>
  );
}
