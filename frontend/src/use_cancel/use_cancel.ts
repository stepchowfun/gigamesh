import axios, { CancelToken } from 'axios';
import { useState, useEffect } from 'react';

export function useCancel(): CancelToken {
  const [cancelToken] = useState(() => {
    return axios.CancelToken.source();
  });

  useEffect(() => {
    return function cleanUp() {
      cancelToken.cancel();
    };
  }, []);

  return cancelToken.token;
}

export function didNotCancel(error: Error): boolean {
  return !axios.isCancel(error);
}
