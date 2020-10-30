import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { SignUpRequest, SignUpResponse } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function signUp(
  payload: Static<typeof SignUpRequest>['payload'],
): Promise<Static<typeof SignUpResponse>['payload']> {
  const envelope: Static<typeof SignUpRequest> = {
    type: 'SignUpRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof SignUpResponse
  >> = await axios.post(
    isProduction()
      ? cloudFunctionsBaseUrlProduction
      : cloudFunctionsBaseUrlDevelopment,
    envelope,
  );

  SignUpResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
