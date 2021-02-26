import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { signUpApiRoute } from '../../../routes/routes';
import { SignUpRequest, SignUpResponse } from '../../types/types';

export default async function signUp(
  request: Static<typeof SignUpRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof SignUpResponse>> {
  const axiosResponse: AxiosResponse<
    Static<typeof SignUpResponse>
  > = await axios.post(signUpApiRoute(), request, { cancelToken });
  SignUpResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
