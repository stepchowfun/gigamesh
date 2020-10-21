import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { SendEmail2Request, SendEmail2Response } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../shared/constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function sendEmail2(
  request: Omit<Static<typeof SendEmail2Request>, 'type'>,
): Promise<Omit<Static<typeof SendEmail2Response>, 'type'>> {
  const payload: Static<typeof SendEmail2Request> = {
    ...request,
    type: 'SendEmail2Request',
  };

  const axiosResponse: AxiosResponse<Static<
    typeof SendEmail2Response
  >> = await axios.post(
    isProduction()
      ? `${cloudFunctionsBaseUrlProduction}/api`
      : `${cloudFunctionsBaseUrlDevelopment}/`,
    payload,
  );

  return axiosResponse.data;
}
