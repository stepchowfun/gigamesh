import { Request, Response } from 'express';
import api from '../api/api';
import { ApiRequest } from '../shared/api/api';
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
    const apiResponse = await api((request.body as unknown) as ApiRequest);

    response.status(200).send(apiResponse);
  }
}
