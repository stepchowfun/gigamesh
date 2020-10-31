import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import { LogInRequest, LogInResponse } from '../shared/api/schema';

export default async function signUp(
  payload: Static<typeof LogInRequest>['payload'],
): Promise<Static<typeof LogInResponse>['payload']> {
  const envelope: Static<typeof LogInRequest> = {
    type: 'LogInRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof LogInResponse
  >> = await axios.post(apiBaseUrl(), envelope);

  LogInResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
