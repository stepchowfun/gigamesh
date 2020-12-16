import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { logOutApiRoute } from '../../../routes/routes';
import { LogOutRequest, LogOutResponse } from '../../types/types';

export default async function logOut(
  request: Static<typeof LogOutRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof LogOutResponse>> {
  const axiosResponse: AxiosResponse<Static<
    typeof LogOutResponse
  >> = await axios.post(logOutApiRoute(), request, { cancelToken });
  LogOutResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
