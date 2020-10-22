import { Request, Response } from 'express';
import { Static } from 'runtypes';
import emailDemo from '../api/emailDemo';
import storageDemo from '../api/storageDemo';
import { ApiRequest, ApiResponse } from '../shared/api/schema';
import {
  originDevelopment,
  originProduction,
} from '../shared/constants/constants';
import { isProduction } from '../shared/environment/environment';

// eslint-disable-next-line import/prefer-default-export
export async function entry(
  request: Request,
  response: Response,
): Promise<void> {
  response.set(
    'Access-Control-Allow-Origin',
    isProduction() ? originProduction : originDevelopment,
  );

  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET, POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '86400'); // 1 day
    response.status(204).send('');
  } else {
    const payload = request.body;

    if (ApiRequest.guard(payload)) {
      const apiResponse = await ApiRequest.match<
        Promise<Static<typeof ApiResponse>>
      >(
        (emailDemoRequest) =>
          emailDemo(emailDemoRequest).then((partialApiResponse) => {
            return { ...partialApiResponse, type: 'EmailDemoResponse' };
          }),
        (storageDemoRequest) =>
          storageDemo(storageDemoRequest).then((partialApiResponse) => {
            return { ...partialApiResponse, type: 'StorageDemoResponse' };
          }),
      )(payload);

      response.status(200).send(apiResponse);
    } else {
      response.status(400).send('');
    }
  }
}
