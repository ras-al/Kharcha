import { useMemo } from 'react';
import { monthKey, monthRange, shiftMonth, trailingMonths } from '../lib/dates';
import {
  buildInsights, categoryBreakdown, dailyTotals, forecastMonth, medianDailySpend, monthlySeries,
  summarize, topExpenses, weekdayPattern,
} from '../lib/stats';
import { useTransactions } from './useTransactions';

const inRange = ({ from, to }) => (t) => t.date >= from && t.date < to;

/**
 * Everything the dashboards need for one month, derived from a single
 * listener over the 12 months ending with that month.
 */
export function useStats(key) {
  const span = useMemo(() => trailingMonths(key, 12), [key]);
  const { data, loading, error, fromCache, refresh } = useTransactions(span);

  const stats = useMemo(() => {
    const curRange = monthRange(key);
    const prevKey = shiftMonth(key, -1);
    const current = data.filter(inRange(curRange));
    const previous = data.filter(inRange(monthRange(prevKey)));
    const year = Number(key.slice(0, 4));
    const ytd = data.filter((t) => t.date.getFullYear() === year && t.date < curRange.to);

    const summary = summarize(current);
    const prevSummary = summarize(previous);
    const today = new Date();
    const isCurrent = monthKey(today) === key;
    // For "so far" comparisons in the running month, cut last month at the same day.
    const prevToDate = isCurrent
      ? previous.filter((t) => t.date.getDate() <= today.getDate())
      : previous;

    const median = medianDailySpend(data);
    const forecast = forecastMonth(current, key, today);
    const todaySpend = isCurrent
      ? current.filter((t) => t.type === 'expense' && t.date.toDateString() === today.toDateString()).reduce((s, t) => s + t.amount, 0)
      : 0;

    return {
      key,
      prevKey,
      current,
      previous,
      summary,
      prevSummary,
      prevToDateSummary: summarize(prevToDate),
      ytd: summarize(ytd),
      breakdown: categoryBreakdown(summary.byCategory),
      series: monthlySeries(data, span.from, span.to),
      daily: dailyTotals(data),
      monthDaily: dailyTotals(current),
      median,
      weekday: weekdayPattern(data, span.from, span.to),
      forecast,
      top: topExpenses(current, 5),
      todaySpend,
      avgDaily: forecast.elapsed ? summary.expense / forecast.elapsed : 0,
      insights: buildInsights({ current, previous: prevToDate, window: data, windowFrom: span.from, windowTo: span.to }),
      span,
    };
  }, [data, key, span]);

  return { ...stats, loading, error, fromCache, refresh, all: data };
}
