import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { changeEmailApiRoute } from '../../../routes/routes';
import { ChangeEmailRequest, ChangeEmailResponse } from '../../types/types';

export default async function changeEmail(
  request: Static<typeof ChangeEmailRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof ChangeEmailResponse>> {
  const axiosResponse: AxiosResponse<Static<typeof ChangeEmailResponse>> =
    await axios.post(changeEmailApiRoute(), request, { cancelToken });
  ChangeEmailResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
