import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import {
  ProposeEmailChangeRequest,
  ProposeEmailChangeResponse,
} from '../shared/api/schema';

export default async function proposeEmailChange(
  payload: Static<typeof ProposeEmailChangeRequest>['payload'],
  cancelToken: CancelToken,
): Promise<Static<typeof ProposeEmailChangeResponse>['payload']> {
  const envelope: Static<typeof ProposeEmailChangeRequest> = {
    type: 'ProposeEmailChangeRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof ProposeEmailChangeResponse
  >> = await axios.post(apiBaseUrl(), envelope, { cancelToken });

  ProposeEmailChangeResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
