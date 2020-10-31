import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import { InviteRequest, InviteResponse } from '../shared/api/schema';

export default async function invite(
  payload: Static<typeof InviteRequest>['payload'],
): Promise<Static<typeof InviteResponse>['payload']> {
  const envelope: Static<typeof InviteRequest> = {
    type: 'InviteRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof InviteResponse
  >> = await axios.post(apiBaseUrl(), envelope);

  InviteResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
