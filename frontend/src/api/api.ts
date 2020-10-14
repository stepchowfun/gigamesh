import axios, { AxiosResponse } from 'axios';

import { HelloWorldRequest, HelloWorldResponse } from '../shared/api/api';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../shared/constants/constants';
import { isProduction } from '../shared/environment/environment';

// eslint-disable-next-line import/prefer-default-export
export async function helloWorld(
  request: HelloWorldRequest,
): Promise<HelloWorldResponse> {
  const axiosResponse: AxiosResponse<HelloWorldResponse> = await axios.post(
    isProduction()
      ? `${cloudFunctionsBaseUrlProduction}/helloWorld`
      : `${cloudFunctionsBaseUrlDevelopment}/`,
    request,
  );

  return axiosResponse.data;
}
