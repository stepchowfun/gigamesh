import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { SendEmail1Request, SendEmail1Response } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../shared/constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function sendEmail1(
  request: Omit<Static<typeof SendEmail1Request>, 'type'>,
): Promise<Omit<Static<typeof SendEmail1Response>, 'type'>> {
  const payload: Static<typeof SendEmail1Request> = {
    ...request,
    type: 'SendEmail1Request',
  };

  const axiosResponse: AxiosResponse<Static<
    typeof SendEmail1Response
  >> = await axios.post(
    isProduction()
      ? `${cloudFunctionsBaseUrlProduction}/api`
      : `${cloudFunctionsBaseUrlDevelopment}/`,
    payload,
  );

  return axiosResponse.data;
}
