import {
  Application,
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import {
  GetHomeDataResponse,
  InviteRequest,
  InviteResponse,
  SignUpResponse,
  inviteRoute,
  rootRoute,
  signUpRoute,
} from 'frontend-lib';
import { Runtype, Static } from 'runtypes';

import UnreachableCaseError from '../unreachable-case-error/unreachable-case-error';
import getHomeData from '../api/endpoints/get-home-data/get-home-data';
import invite from '../api/endpoints/invite/invite';
import renderPage from '../page/page';
import signUp from '../api/endpoints/sign-up/sign-up';
import { Envelope } from '../api/util/envelope/envelope';
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
  app.get(
    rootRoute(),
    (request: Request, response: Response, next: NextFunction) => {
      getHomeData({ payload: {}, sessionId: getSessionId(request) })
        .then((apiResponse: Envelope<Static<typeof GetHomeDataResponse>>) => {
          const { payload } = apiResponse;
          switch (payload.type) {
            case 'Success':
              renderPage(response, {
                type: 'LoggedIn',
                user: payload.user,
              });
              break;
            case 'NotLoggedIn':
              renderPage(response, {
                type: 'NotLoggedIn',
              });
              break;
            default:
              throw new UnreachableCaseError(payload);
          }
        })
        .catch(next);
    },
  );

  app.get(
    signUpRoute(':signupProposalId'),
    (request: Request, response: Response, next: NextFunction) => {
      signUp({
        payload: { signupProposalId: request.params.signupProposalId },
        sessionId: getSessionId(request),
      })
        .then((apiResponse: Envelope<Static<typeof SignUpResponse>>) => {
          const { payload } = apiResponse;
          switch (payload.type) {
            case 'Success':
              setSessionId(response, apiResponse.sessionId);
              renderPage(response, { type: 'SignedUp' });
              break;
            case 'ProposalExpiredOrInvalid':
              renderPage(response, { type: 'PageNotFound' });
              break;
            default:
              throw new UnreachableCaseError(payload);
          }
        })
        .catch(next);
    },
  );

  installApiRoute<Static<typeof InviteRequest>, Static<typeof InviteResponse>>(
    app,
    inviteRoute(),
    InviteRequest,
    invite,
  );
}
