import { useEffect, useState } from 'react';
import { getJson } from './client.js';

export type ApiState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export function useApiResource<T>(path: string) {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading' });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<T>(path)
      .then((data) => { if (active) setState({ status: 'success', data }); })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unable to load this information.' });
      });
    return () => { active = false; };
  }, [path, revision]);

  return { state, reload: () => setRevision((current) => current + 1) };
}