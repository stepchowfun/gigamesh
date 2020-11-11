import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { apiBaseUrl } from '../constants/constants';
import { SignUpRequest, SignUpResponse } from './schema';

export default async function signUp(
  payload: Static<typeof SignUpRequest>['payload'],
  cancelToken: CancelToken,
): Promise<Static<typeof SignUpResponse>['payload']> {
  const envelope: Static<typeof SignUpRequest> = {
    type: 'SignUpRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof SignUpResponse
  >> = await axios.post(apiBaseUrl(), envelope, { cancelToken });

  SignUpResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
