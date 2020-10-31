import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { InviteRequest, InviteResponse } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../constants/constants';
import isProduction from '../shared/environment/environment';

export default async function invite(
  payload: Static<typeof InviteRequest>['payload'],
): Promise<Static<typeof InviteResponse>['payload']> {
  const envelope: Static<typeof InviteRequest> = {
    type: 'InviteRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof InviteResponse
  >> = await axios.post(
    isProduction()
      ? cloudFunctionsBaseUrlProduction
      : cloudFunctionsBaseUrlDevelopment,
    envelope,
  );

  InviteResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
