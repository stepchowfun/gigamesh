import axios, { AxiosResponse } from 'axios';
import { Static } from 'runtypes';

import apiBaseUrl from '../constants/constants';
import { DeleteUserRequest, DeleteUserResponse } from '../shared/api/schema';

export default async function deleteUser(
  payload: Static<typeof DeleteUserRequest>['payload'],
): Promise<Static<typeof DeleteUserResponse>['payload']> {
  const envelope: Static<typeof DeleteUserRequest> = {
    type: 'DeleteUserRequest',
    payload,
  };

  const axiosResponse: AxiosResponse<Static<
    typeof DeleteUserResponse
  >> = await axios.post(apiBaseUrl(), envelope);

  DeleteUserResponse.check(axiosResponse.data);

  return axiosResponse.data.payload;
}
