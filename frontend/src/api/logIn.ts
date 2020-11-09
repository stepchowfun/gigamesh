import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { apiBaseUrl } from '../constants/constants';
import { LogInRequest, LogInResponse } from '../shared/api/schema';

export default async function logIn(
  payload: Static<typeof LogInRequest>['payload'],
  cancelToken: CancelToken,
): Promise<Static<typeof LogInResponse>['payload']> {
  const envelope: Static<typeof LogInRequest> = {
    type: 'LogInRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof LogInResponse
  >> = await axios.post(apiBaseUrl(), envelope, { cancelToken });

  LogInResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
