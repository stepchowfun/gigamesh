import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { InviteRequest, InviteResponse } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function invite(
  request: Omit<Static<typeof InviteRequest>, 'type'>,
): Promise<Omit<Static<typeof InviteResponse>, 'type'>> {
  const payload: Static<typeof InviteRequest> = {
    ...request,
    type: 'InviteRequest',
  };

  const axiosResponse: AxiosResponse<Static<
    typeof InviteResponse
  >> = await axios.post(
    isProduction()
      ? cloudFunctionsBaseUrlProduction
      : cloudFunctionsBaseUrlDevelopment,
    payload,
  );

  return axiosResponse.data;
}
