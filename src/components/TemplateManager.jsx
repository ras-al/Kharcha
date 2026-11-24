import { Trash } from '@phosphor-icons/react';
import { useToast } from '../context/ToastContext';
import { useTemplates } from '../hooks/useRecords';
import { formatINR } from '../lib/format';
import CategoryIcon from './CategoryIcon';
import { TemplateForm } from './records/RecordForms';

/** Create and delete recurring templates. They appear as one-tap chips on Home. */
export default function TemplateManager() {
  const toast = useToast();
  const { templates, save, remove } = useTemplates();
  return (
    <div>
      {templates.length > 0 && (
        <ul className="divide-y divide-line mb-5">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <CategoryIcon id={t.category} size={36} />
              <span className="flex-1 font-bold">{t.name}<span className="block text-sm text-muted font-semibold">{t.category}</span></span>
              <span className="num font-bold">{formatINR(t.amount)}</span>
              <button type="button" className="icon-btn text-muted" aria-label={`Delete template ${t.name}`} onClick={() => remove(t.id)}><Trash size={18} weight="bold" /></button>
            </li>
          ))}
        </ul>
      )}
      <TemplateForm onSave={(data) => { save(data); toast(`Template ${data.name} saved`); }} />
    </div>
  );
}
