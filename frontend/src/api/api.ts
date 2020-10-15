import axios, { AxiosResponse } from 'axios';

import { ApiRequest, ApiResponse } from '../shared/api/api';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../shared/constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function api(request: ApiRequest): Promise<ApiResponse> {
  const axiosResponse: AxiosResponse<ApiResponse> = await axios.post(
    isProduction()
      ? `${cloudFunctionsBaseUrlProduction}/api`
      : `${cloudFunctionsBaseUrlDevelopment}/`,
    request,
  );

  return axiosResponse.data;
}
