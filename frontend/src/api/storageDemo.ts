import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';
import { StorageDemoRequest, StorageDemoResponse } from '../shared/api/schema';
import {
  cloudFunctionsBaseUrlDevelopment,
  cloudFunctionsBaseUrlProduction,
} from '../constants/constants';
import { isProduction } from '../shared/environment/environment';

export default async function storageDemo(
  request: Omit<Static<typeof StorageDemoRequest>, 'type'>,
): Promise<Omit<Static<typeof StorageDemoResponse>, 'type'>> {
  const payload: Static<typeof StorageDemoRequest> = {
    ...request,
    type: 'StorageDemoRequest',
  };

  const axiosResponse: AxiosResponse<Static<
    typeof StorageDemoResponse
  >> = await axios.post(
    isProduction()
      ? cloudFunctionsBaseUrlProduction
      : cloudFunctionsBaseUrlDevelopment,
    payload,
  );

  return axiosResponse.data;
}
