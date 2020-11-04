import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import { GetUserRequest, GetUserResponse } from '../shared/api/schema';

export default async function getUser(
  payload: Static<typeof GetUserRequest>['payload'],
): Promise<Static<typeof GetUserResponse>['payload']> {
  const envelope: Static<typeof GetUserRequest> = {
    type: 'GetUserRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof GetUserResponse
  >> = await axios.post(apiBaseUrl(), envelope);

  GetUserResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
