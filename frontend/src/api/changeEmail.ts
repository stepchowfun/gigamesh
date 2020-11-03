import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import { ChangeEmailRequest, ChangeEmailResponse } from '../shared/api/schema';

export default async function changeEmail(
  payload: Static<typeof ChangeEmailRequest>['payload'],
): Promise<Static<typeof ChangeEmailResponse>['payload']> {
  const envelope: Static<typeof ChangeEmailRequest> = {
    type: 'ChangeEmailRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof ChangeEmailResponse
  >> = await axios.post(apiBaseUrl(), envelope);

  ChangeEmailResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
