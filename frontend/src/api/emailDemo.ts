import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { EmailDemoRequest, EmailDemoResponse } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function emailDemo(
  request: Omit<Static<typeof EmailDemoRequest>, 'type'>,
): Promise<Omit<Static<typeof EmailDemoResponse>, 'type'>> {
  const payload: Static<typeof EmailDemoRequest> = {
    ...request,
    type: 'EmailDemoRequest',
  };

  const axiosResponse: AxiosResponse<Static<
    typeof EmailDemoResponse
  >> = await axios.post(
    isProduction()
      ? cloudFunctionsBaseUrlProduction
      : cloudFunctionsBaseUrlDevelopment,
    payload,
  );

  return axiosResponse.data;
}
