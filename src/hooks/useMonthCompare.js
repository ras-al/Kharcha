import { useMemo } from 'react';
import { compareSummaries, summarize } from '../lib/stats';
import { useMonthTransactions } from './useTransactions';

/** Category-by-category comparison of any two months. */
export function useMonthCompare(a, b) {
  const left = useMonthTransactions(a);
  const right = useMonthTransactions(b);
  return useMemo(() => {
    const sa = summarize(left.data);
    const sb = summarize(right.data);
    return {
      a: sa,
      b: sb,
      rows: compareSummaries(sa, sb),
      loading: left.loading || right.loading,
      error: left.error || right.error,
    };
  }, [left.data, right.data, left.loading, right.loading, left.error, right.error]);
}
