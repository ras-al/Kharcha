import CategoryBars from '../../components/CategoryBars';
import CategoryDonut from '../../components/charts/CategoryDonut';
import MonthlyBars from '../../components/charts/MonthlyBars';
import WeekdayBars from '../../components/charts/WeekdayBars';
import Insights from '../../components/Insights';
import MonthCompare from '../../components/MonthCompare';
import MonthSwitcher from '../../components/MonthSwitcher';
import { ErrorState, Skeleton } from '../../components/States';
import { usePeriod } from '../../context/PeriodContext';
import { useBudgets } from '../../hooks/useRecords';
import { useStats } from '../../hooks/useStats';
import { formatINR } from '../../lib/format';
import MobileHeader from '../../components/MobileHeader';

function Card({ title, children, note }) {
  return (
    <section className="card p-5">
      <h2 className="text-lg">{title}</h2>
      {note && <p className="text-sm text-muted mt-0.5">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function StatsMobile() {
  const { month, setMonth } = usePeriod();
  const s = useStats(month);
  const { limits } = useBudgets();

  return (
    <div className="space-y-4">
      <MobileHeader title="Stats" action={<MonthSwitcher value={month} onChange={setMonth} narrow />} />
      {s.error && <ErrorState error={s.error} />}

      <Card title="Where it went">
        {s.loading ? <Skeleton className="h-[220px]" /> : <CategoryDonut breakdown={s.breakdown} total={s.summary.expense} height={220} />}
      </Card>

      {s.insights.length > 0 && <Insights items={s.insights} />}

      <Card title="Last 12 months" note="Dark grey is core spending, light grey is hostel and academics.">
        {s.loading ? <Skeleton className="h-[220px]" /> : <MonthlyBars series={s.series} height={220} activeKey={month} narrow />}
      </Card>

      <Card title="By category">
        <CategoryBars breakdown={s.breakdown} limits={limits} />
      </Card>

      {s.forecast.isCurrent && (
        <Card title="Month-end estimate">
          <p className="text-[15px]">
            Core spending is <b className="num">{formatINR(s.forecast.pace)}</b> a day over {s.forecast.elapsed} days. At that pace it reaches about{' '}
            <b className="num">{formatINR(s.forecast.projectedCore)}</b> by day {s.forecast.total}, or <b className="num">{formatINR(s.forecast.projectedTotal)}</b> with hostel and academics already paid.
          </p>
        </Card>
      )}

      <Card title="Weekday pattern" note="Average core spend per day of the week, last 12 months.">
        <WeekdayBars data={s.weekday} height={180} />
      </Card>

      <Card title="Compare months">
        <MonthCompare anchor={month} compact />
      </Card>
    </div>
  );
}
