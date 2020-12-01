import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { apiBaseUrl } from '../constants/constants';
import { InviteRequest, InviteResponse } from './schema';

export default async function invite(
  payload: Static<typeof InviteRequest>['payload'],
  cancelToken: CancelToken,
): Promise<Static<typeof InviteResponse>['payload']> {
  const envelope: Static<typeof InviteRequest> = {
    type: 'InviteRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof InviteResponse
  >> = await axios.post(apiBaseUrl(), envelope, { cancelToken });

  InviteResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
