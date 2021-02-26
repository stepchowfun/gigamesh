import axios, { AxiosResponse, CancelToken } from 'axios';
import { Static } from 'runtypes';

import { deleteUserApiRoute } from '../../../routes/routes';
import { DeleteUserRequest, DeleteUserResponse } from '../../types/types';

export default async function deleteUser(
  request: Static<typeof DeleteUserRequest>,
  cancelToken: CancelToken,
): Promise<Static<typeof DeleteUserResponse>> {
  const axiosResponse: AxiosResponse<
    Static<typeof DeleteUserResponse>
  > = await axios.post(deleteUserApiRoute(), request, { cancelToken });
  DeleteUserResponse.check(axiosResponse.data);
  return axiosResponse.data;
}
