import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { apiBaseUrl } from '../../constants/constants';
import { InviteRequest, InviteResponse } from '../types/types';

export default async function invite(
  request: Static<typeof InviteRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof InviteResponse>> {
  const axiosResponse: AxiosResponse<Static<
    typeof InviteResponse
  >> = await axios.post(`${apiBaseUrl}invite`, request, { cancelToken });
  InviteResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
