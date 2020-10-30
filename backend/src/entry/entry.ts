import express, { Request, Response } from 'express';
import { Static } from 'runtypes';
import invite from '../api/invite';
import logger from '../logger/logger';
import signUp from '../api/signUp';
import { PostRequest, PostResponse } from '../shared/api/schema';
import { originDevelopment, originProduction } from '../constants/constants';
import { isProduction } from '../shared/environment/environment';

async function handlePost(request: Request, response: Response): Promise<void> {
  response.set(
    'Access-Control-Allow-Origin',
    isProduction() ? originProduction : originDevelopment,
  );

  const { body: requestEnvelope } = request;

  if (PostRequest.guard(requestEnvelope)) {
    logger.info('Received valid request.', { requestEnvelope });

    const apiResponse = await PostRequest.match<
      Promise<Static<typeof PostResponse>>
    >(
      (refinedEnvelope) =>
        invite(refinedEnvelope.payload).then((responsePayload) => {
          return { type: 'InviteResponse', payload: responsePayload };
        }),
      (refinedEnvelope) =>
        signUp(refinedEnvelope.payload).then((responsePayload) => {
          return { type: 'SignUpResponse', payload: responsePayload };
        }),
    )(requestEnvelope);

    response.status(200).send(apiResponse);
  } else {
    logger.info('Bad request.', { requestEnvelope });
    response.status(400).send('Bad Request');
  }
}

function handleOptions(request: Request, response: Response): void {
  response.set(
    'Access-Control-Allow-Origin',
    isProduction() ? originProduction : originDevelopment,
  );
  response.set('Access-Control-Allow-Methods', 'POST');
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

// Set up the main route.
app.post('/', (request, response, next) =>
  handlePost(request, response).catch(next),
);

// Set up the CORS route.
app.options('/', handleOptions);

// Start the server.
app.listen(port, () => {
  // The server has started.
  logger.info('Server started.', { port });
});
