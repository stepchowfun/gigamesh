import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import { SignUpRequest, SignUpResponse } from '../shared/api/schema';

export default async function signUp(
  payload: Static<typeof SignUpRequest>['payload'],
): Promise<Static<typeof SignUpResponse>['payload']> {
  const envelope: Static<typeof SignUpRequest> = {
    type: 'SignUpRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof SignUpResponse
  >> = await axios.post(apiBaseUrl(), envelope);

  SignUpResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
