import { useEffect, useRef, useState } from 'react';
import { readableError } from '../lib/errors';

export function useAsyncData<T>(load: () => Promise<T>, key: string) {
  const loader = useRef(load); loader.current = load;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError(''); setData(null);
    void loader.current().then((value) => { if (alive) setData(value); }).catch((err) => { if (alive) setError(readableError(err)); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [key, revision]);
  return { data, error, loading, reload: () => setRevision((v) => v + 1) };
}
