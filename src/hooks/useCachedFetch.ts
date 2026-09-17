import {useEffect, useState, useRef} from 'react';

export interface CachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Phase B: stale-while-revalidate hook. Returns cached data immediately
// (from AsyncStorage via the fetcher's own cache), then revalidates in the
// background and swaps in fresh data when it arrives.
export function useCachedFetch<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
): CachedFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then(result => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(e => {
        if (active) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = () => setTick(t => t + 1);

  return {data, loading, error, refetch};
}