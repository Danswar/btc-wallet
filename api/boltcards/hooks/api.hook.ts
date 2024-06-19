import { useMemo } from 'react';
import Config from 'react-native-config';

export interface ApiInterface {
  call: <T>(config: CallConfig) => Promise<T>;
}

export interface CallConfig {
  url: string;
  method: 'GET' | 'PUT' | 'POST' | 'DELETE';
  data?: any;
  apiKey?: string;
}

export function useApi(): ApiInterface {
  function buildInit(method: 'GET' | 'PUT' | 'POST' | 'DELETE', apiKey?: string | null, data?: any): RequestInit {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey || '',
      },
      body: JSON.stringify(data),
    };
  }

  async function call<T>(config: CallConfig): Promise<T> {
    return fetch(`${Config.REACT_APP_LDS_DEV_URL}/${config.url}`, buildInit(config.method, config.apiKey, config.data)).then(response => {
      if (response.ok) {
        return response.json().catch(() => undefined);
      }
      return response.json().then(body => {
        throw body;
      });
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ call }), []);
}
