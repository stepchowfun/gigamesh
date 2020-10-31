import express, { Request, Response } from 'express';
import { Static } from 'runtypes';

import deleteUser from '../api/deleteUser';
import invite from '../api/invite';
import logIn from '../api/logIn';
import logOut from '../api/logOut';
import logger from '../logger/logger';
import signUp from '../api/signUp';
import { PostRequest, PostResponse } from '../shared/api/schema';
import { origin } from '../constants/constants';

function setAllowOrigin(response: Response): void {
  response.set('Access-Control-Allow-Origin', origin());
}

async function handlePost(request: Request, response: Response): Promise<void> {
  setAllowOrigin(response);

  const { body: requestEnvelope } = request;

  if (PostRequest.guard(requestEnvelope)) {
    logger.info('Received valid request.', { requestEnvelope });

    const apiResponse = await PostRequest.match<
      Promise<Static<typeof PostResponse>>
    >(
      // The functions here must be in the same order as
      // [ref:request_type_union_order].
      (refinedEnvelope) =>
        invite(refinedEnvelope.payload).then((responsePayload) => {
          return { type: 'InviteResponse', payload: responsePayload };
        }),
      (refinedEnvelope) =>
        signUp(refinedEnvelope.payload).then((responsePayload) => {
          return { type: 'SignUpResponse', payload: responsePayload };
        }),
      (refinedEnvelope) =>
        logIn(refinedEnvelope.payload).then((responsePayload) => {
          return { type: 'LogInResponse', payload: responsePayload };
        }),
      (refinedEnvelope) =>
        logOut(refinedEnvelope.payload).then((responsePayload) => {
          return { type: 'LogOutResponse', payload: responsePayload };
        }),
      (refinedEnvelope) =>
        deleteUser(refinedEnvelope.payload).then((responsePayload) => {
          return { type: 'DeleteUserResponse', payload: responsePayload };
        }),
    )(requestEnvelope);

    response.status(200).send(apiResponse);
  } else {
    logger.info('Bad request.', { requestEnvelope });
    response.status(400).send('Bad Request');
  }
}

function handleOptions(request: Request, response: Response): void {
  setAllowOrigin(response);
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
