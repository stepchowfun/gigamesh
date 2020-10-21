import { Request, Response } from 'express';
import { Static } from 'runtypes';
import sendEmail1 from '../api/sendEmail1';
import sendEmail2 from '../api/sendEmail2';
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
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
  } else {
    const payload = request.body;

    if (ApiRequest.guard(payload)) {
      const apiResponse = await ApiRequest.match<
        Promise<Static<typeof ApiResponse>>
      >(
        (sendEmail1Request) =>
          sendEmail1(sendEmail1Request).then((partialApiResponse) => {
            return { ...partialApiResponse, type: 'SendEmail1Response' };
          }),
        (sendEmail2Request) =>
          sendEmail2(sendEmail2Request).then((partialApiResponse) => {
            return { ...partialApiResponse, type: 'SendEmail2Response' };
          }),
      )(payload);

      response.status(200).send(apiResponse);
    } else {
      response.status(400).send('');
    }
  }
}
