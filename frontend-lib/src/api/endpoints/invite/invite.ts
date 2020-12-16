import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { inviteApiRoute } from '../../../routes/routes';
import { InviteRequest, InviteResponse } from '../../types/types';

export default async function invite(
  request: Static<typeof InviteRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof InviteResponse>> {
  const axiosResponse: AxiosResponse<Static<
    typeof InviteResponse
  >> = await axios.post(inviteApiRoute(), request, { cancelToken });
  InviteResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
