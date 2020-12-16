import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { getHomeDataApiRoute } from '../../../routes/routes';
import { GetHomeDataRequest, GetHomeDataResponse } from '../../types/types';

export default async function getHomeData(
  request: Static<typeof GetHomeDataRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof GetHomeDataResponse>> {
  const axiosResponse: AxiosResponse<Static<
    typeof GetHomeDataResponse
  >> = await axios.post(getHomeDataApiRoute(), request, { cancelToken });
  GetHomeDataResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
