import express, { Request, Response } from 'express';
import { Static } from 'runtypes';
import emailDemo from '../api/emailDemo';
import logger from '../logger/logger';
import storageDemo from '../api/storageDemo';
import { ApiRequest, ApiResponse } from '../shared/api/schema';
import {
  originDevelopment,
  originProduction,
} from '../shared/constants/constants';
import { isProduction } from '../shared/environment/environment';

async function handleRpc(request: Request, response: Response): Promise<void> {
  response.set(
    'Access-Control-Allow-Origin',
    isProduction() ? originProduction : originDevelopment,
  );

  const payload = request.body;

  if (ApiRequest.guard(payload)) {
    logger.info('Received valid request.', { request: payload });

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
    logger.info('Bad request.', { request: payload });
    response.status(400).send('Bad Request');
  }
}

function handleOptions(request: Request, response: Response): void {
  response.set(
    'Access-Control-Allow-Origin',
    isProduction() ? originProduction : originDevelopment,
  );
  response.set('Access-Control-Allow-Methods', 'GET, POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  response.set('Access-Control-Max-Age', '86400'); // 1 day
  response.status(204).send('');
}

// Read the `PORT` environment variable.
const port = process.env.PORT;

// Construct the Express app.
const app = express();

// Populate the `body` field of incoming requests.
app.use(express.json());

// Disable the `x-powered-by` header.
app.disable('x-powered-by');

// Set up routes.
app.get('/', handleRpc);
app.post('/', handleRpc);
app.options('/', handleOptions);

// Start the server.
app.listen(port, () => {
  // The server has started.
  logger.info('Server started.', { port });
});
