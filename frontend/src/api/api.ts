import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import { ApiRequest, ApiResponse } from '../shared/api/api';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../shared/constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function api(
  request: Static<typeof ApiRequest>,
): Promise<Static<typeof ApiResponse>> {
  const axiosResponse: AxiosResponse<Static<
    typeof ApiResponse
  >> = await axios.post(
    isProduction()
      ? `${cloudFunctionsBaseUrlProduction}/api`
      : `${cloudFunctionsBaseUrlDevelopment}/`,
    request,
  );

  return axiosResponse.data;
}
