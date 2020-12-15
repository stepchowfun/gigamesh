import {
  Application,
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import {
  BootstrapData,
  InviteRequest,
  InviteResponse,
  SignUpRequest,
  SignUpResponse,
} from 'frontend-lib';
import { Runtype, Static } from 'runtypes';

import invite from '../api/invite/invite';
import signUp from '../api/sign-up/sign-up';
import renderPage from '../page/page';
import { Envelope } from '../api/envelope/envelope';
import {
  isProduction,
  sessionLifespanSinceCreationMs,
} from '../constants/constants';

const sessionIdCookieName = 'sessionId';

// Extract the session ID from the request, if present.
function getSessionId(request: Request): string | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof request.cookies[sessionIdCookieName] === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return request.cookies[sessionIdCookieName];
  }

  return null;
}

// Set the session ID on the response, if given.
function setSessionId(response: Response, sessionId: string | null): void {
  const options: CookieOptions = {
    httpOnly: true,
    maxAge: sessionLifespanSinceCreationMs,
    sameSite: 'lax',
    secure: isProduction,
  };

  if (sessionId === null) {
    response.clearCookie(sessionIdCookieName, options);
  } else {
    response.cookie(sessionIdCookieName, sessionId, options);
  }
}

// Install an API route.
function installApiRoute<RequestType, ResponseType>(
  app: Application,
  route: string,
  requestType: Runtype<RequestType>,
  handler: (request: Envelope<RequestType>) => Promise<Envelope<ResponseType>>,
): void {
  app.post(
    route,
    (request: Request, response: Response, next: NextFunction) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { body } = request;

      if (requestType.guard(body)) {
        handler({ payload: body, sessionId: getSessionId(request) })
          .then((apiResponse: Envelope<ResponseType>) => {
            setSessionId(response, apiResponse.sessionId);
            response.status(200).send(apiResponse.payload);
          })
          .catch(next);
      } else {
        response.status(400).send('Bad Request');
      }
    },
  );
}

// Install the routes in an Express app.
export default function installRoutes(app: Application): void {
  app.get('/', (request: Request, response: Response) => {
    const bootstrapData: BootstrapData = {
      type: 'NotLoggedIn',
    };

    renderPage(response, bootstrapData);
  });

  installApiRoute<Static<typeof InviteRequest>, Static<typeof InviteResponse>>(
    app,
    '/api/invite',
    InviteRequest,
    invite,
  );

  installApiRoute<Static<typeof SignUpRequest>, Static<typeof SignUpResponse>>(
    app,
    '/api/sign-up',
    SignUpRequest,
    signUp,
  );
}
