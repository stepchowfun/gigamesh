import axios, { AxiosResponse } from 'axios';

import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from './shared/constants';
import { isProduction } from './shared/environment';

// eslint-disable-next-line import/prefer-default-export
export function helloWorld(message: string): Promise<AxiosResponse<string>> {
  return axios.get(
    isProduction()
      ? `${cloudFunctionsBaseUrlProduction}/helloWorld`
      : `${cloudFunctionsBaseUrlDevelopment}/`,
    {
      params: { message },
    },
  );
}
