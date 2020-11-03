import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import {
  RequestChangeEmailRequest,
  RequestChangeEmailResponse,
} from '../shared/api/schema';

export default async function requestChangeEmail(
  payload: Static<typeof RequestChangeEmailRequest>['payload'],
): Promise<Static<typeof RequestChangeEmailResponse>['payload']> {
  const envelope: Static<typeof RequestChangeEmailRequest> = {
    type: 'RequestChangeEmailRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof RequestChangeEmailResponse
  >> = await axios.post(apiBaseUrl(), envelope);

  RequestChangeEmailResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
