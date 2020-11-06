import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import { LogOutRequest, LogOutResponse } from '../shared/api/schema';

export default async function logOut(
  payload: Static<typeof LogOutRequest>['payload'],
  cancelToken: CancelToken,
): Promise<Static<typeof LogOutResponse>['payload']> {
  const envelope: Static<typeof LogOutRequest> = {
    type: 'LogOutRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof LogOutResponse
  >> = await axios.post(apiBaseUrl(), envelope, { cancelToken });

  LogOutResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
