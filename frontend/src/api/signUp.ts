import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { SignUpRequest, SignUpResponse } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function signUp(
  request: Omit<Static<typeof SignUpRequest>, 'type'>,
): Promise<Omit<Static<typeof SignUpResponse>, 'type'>> {
  const payload: Static<typeof SignUpRequest> = {
    ...request,
    type: 'SignUpRequest',
  };

  const axiosResponse: AxiosResponse<Static<
    typeof SignUpResponse
  >> = await axios.post(
    isProduction()
      ? cloudFunctionsBaseUrlProduction
      : cloudFunctionsBaseUrlDevelopment,
    payload,
  );

  return axiosResponse.data;
}
