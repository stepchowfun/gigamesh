import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { logInApiRoute } from '../../../routes/routes';
import { LogInRequest, LogInResponse } from '../../types/types';

export default async function logIn(
  request: Static<typeof LogInRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof LogInResponse>> {
  const axiosResponse: AxiosResponse<Static<typeof LogInResponse>> =
    await axios.post(logInApiRoute(), request, { cancelToken });
  LogInResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
