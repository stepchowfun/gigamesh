import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { proposeEmailChangeApiRoute } from '../../../routes/routes';
import {
  ProposeEmailChangeRequest,
  ProposeEmailChangeResponse,
} from '../../types/types';

export default async function proposeEmailChange(
  request: Static<typeof ProposeEmailChangeRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof ProposeEmailChangeResponse>> {
  const axiosResponse: AxiosResponse<Static<
    typeof ProposeEmailChangeResponse
  >> = await axios.post(proposeEmailChangeApiRoute(), request, { cancelToken });
  ProposeEmailChangeResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
