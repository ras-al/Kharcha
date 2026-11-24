import { Repeat } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTemplates } from '../hooks/useRecords';
import { useTransactionActions } from '../hooks/useTransactionActions';
import { formatINR } from '../lib/format';
import { deleteTransaction } from '../services/transactions.service';
import CategoryIcon from './CategoryIcon';

/** One tap adds a recurring expense (for example the monthly hostel fee) for today. */
export default function TemplateChips({ scroll = false }) {
  const { user } = useAuth();
  const toast = useToast();
  const { templates } = useTemplates();
  const { add } = useTransactionActions();
  if (!templates.length) return null;

  const use = (t) => {
    const id = add({ type: 'expense', category: t.category, amount: t.amount, note: t.note || t.name, date: new Date(), origin: 'template' }, { silent: true });
    toast(`${t.name} ${formatINR(t.amount)} added for today`, { action: { label: 'Undo', onClick: () => deleteTransaction(user.uid, id) } });
  };

  return (
    <div>
      <p className="eyebrow mb-2 flex items-center gap-1.5"><Repeat size={14} weight="bold" aria-hidden="true" /> Recurring</p>
      <div className={`flex gap-2 ${scroll ? 'overflow-x-auto overscroll-x-contain no-scrollbar -mx-4 px-4' : 'flex-wrap'}`}>
        {templates.map((t) => (
          <button key={t.id} type="button" className="chip shrink-0" onClick={() => use(t)} aria-label={`Add ${t.name}, ${formatINR(t.amount)}, today`}>
            <CategoryIcon id={t.category} size={32} variant="tint" />
            {t.name}
            <span className="num text-muted">{formatINR(t.amount)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
