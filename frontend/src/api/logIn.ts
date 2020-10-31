import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { LogInRequest, LogInResponse } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../constants/constants';
import isProduction from '../shared/environment/environment';

export default async function signUp(
  payload: Static<typeof LogInRequest>['payload'],
): Promise<Static<typeof LogInResponse>['payload']> {
  const envelope: Static<typeof LogInRequest> = {
    type: 'LogInRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof LogInResponse
  >> = await axios.post(
    isProduction()
      ? cloudFunctionsBaseUrlProduction
      : cloudFunctionsBaseUrlDevelopment,
    envelope,
  );

  LogInResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
