import {
  Application,
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import {
  ChangeEmailRequest,
  ChangeEmailResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  GetHomeDataRequest,
  GetHomeDataResponse,
  InviteRequest,
  InviteResponse,
  LogInRequest,
  LogInResponse,
  LogOutRequest,
  LogOutResponse,
  ProposeEmailChangeRequest,
  ProposeEmailChangeResponse,
  SignUpRequest,
  SignUpResponse,
  UnreachableCaseError,
  changeEmailApiRoute,
  changeEmailWebRoute,
  deleteUserApiRoute,
  getHomeDataApiRoute,
  inviteApiRoute,
  logInApiRoute,
  logInWebRoute,
  logOutApiRoute,
  proposeEmailChangeApiRoute,
  rootWebRoute,
  signUpApiRoute,
  signUpWebRoute,
} from 'frontend-lib';
import { Runtype, Static } from 'runtypes';

import changeEmail from '../api/endpoints/change-email/change-email';
import deleteUser from '../api/endpoints/delete-user/delete-user';
import getHomeData from '../api/endpoints/get-home-data/get-home-data';
import invite from '../api/endpoints/invite/invite';
import logIn from '../api/endpoints/log-in/log-in';
import logOut from '../api/endpoints/log-out/log-out';
import proposeEmailChange from '../api/endpoints/propose-email-change/propose-email-change';
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
function setSessionId(
  previousSessionId: string | null,
  response: Response,
  sessionId: string | null,
): void {
  const options: CookieOptions = {
    httpOnly: true,
    maxAge: sessionLifespanSinceCreationMs,
    sameSite: 'lax',
    secure: isProduction,
  };

  if (sessionId !== previousSessionId) {
    if (sessionId === null) {
      response.clearCookie(sessionIdCookieName, { options, ...{ maxAge: 1 } });
    } else {
      response.cookie(sessionIdCookieName, sessionId, options);
    }
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

      const sessionId = getSessionId(request);

      if (requestType.guard(body)) {
        handler({ payload: body, sessionId })
          .then((apiResponse: Envelope<ResponseType>) => {
            setSessionId(sessionId, response, apiResponse.sessionId);

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
  // Web routes (in alphabetical order)

  app.get(
    changeEmailWebRoute(':emailChangeProposalId'),
    (request: Request, response: Response, next: NextFunction) => {
      const sessionId = getSessionId(request);

      changeEmail({
        payload: {
          emailChangeProposalId: request.params.emailChangeProposalId,
        },
        sessionId,
      })
        .then((apiResponse: Envelope<Static<typeof ChangeEmailResponse>>) => {
          setSessionId(sessionId, response, apiResponse.sessionId);

          const { payload } = apiResponse;
          switch (payload.type) {
            case 'Success':
              renderPage(response, { type: 'BootstrapRedirectToHomePage' });
              break;
            case 'NotLoggedIn':
              renderPage(response, { type: 'BootstrapPageNotFound' });
              break;
            case 'ProposalExpiredOrInvalid':
              renderPage(response, { type: 'BootstrapPageNotFound' });
              break;
            default:
              throw new UnreachableCaseError(payload);
          }
        })
        .catch(next);
    },
  );

  app.get(
    logInWebRoute(':loginProposalId'),
    (request: Request, response: Response, next: NextFunction) => {
      const sessionId = getSessionId(request);

      logIn({
        payload: { loginProposalId: request.params.loginProposalId },
        sessionId,
      })
        .then((apiResponse: Envelope<Static<typeof LogInResponse>>) => {
          setSessionId(sessionId, response, apiResponse.sessionId);

          const { payload } = apiResponse;
          switch (payload.type) {
            case 'Success':
              renderPage(response, { type: 'BootstrapRedirectToHomePage' });
              break;
            case 'ProposalExpiredOrInvalid':
              renderPage(response, { type: 'BootstrapPageNotFound' });
              break;
            default:
              throw new UnreachableCaseError(payload);
          }
        })
        .catch(next);
    },
  );

  app.get(
    rootWebRoute(),
    (request: Request, response: Response, next: NextFunction) => {
      const sessionId = getSessionId(request);

      getHomeData({ payload: {}, sessionId })
        .then((apiResponse: Envelope<Static<typeof GetHomeDataResponse>>) => {
          setSessionId(sessionId, response, apiResponse.sessionId);

          const { payload } = apiResponse;
          switch (payload.type) {
            case 'Success':
              renderPage(response, {
                type: 'BootstrapHomePage',
                user: payload.user,
              });
              break;
            case 'NotLoggedIn':
              renderPage(response, {
                type: 'BootstrapLandingPage',
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
    signUpWebRoute(':signupProposalId'),
    (request: Request, response: Response, next: NextFunction) => {
      const sessionId = getSessionId(request);

      signUp({
        payload: { signupProposalId: request.params.signupProposalId },
        sessionId,
      })
        .then((apiResponse: Envelope<Static<typeof SignUpResponse>>) => {
          setSessionId(sessionId, response, apiResponse.sessionId);

          const { payload } = apiResponse;
          switch (payload.type) {
            case 'Success':
              renderPage(response, { type: 'BootstrapRedirectToHomePage' });
              break;
            case 'ProposalExpiredOrInvalid':
              renderPage(response, { type: 'BootstrapPageNotFound' });
              break;
            default:
              throw new UnreachableCaseError(payload);
          }
        })
        .catch(next);
    },
  );

  // API routes (in alphabetical order)

  installApiRoute<
    Static<typeof ChangeEmailRequest>,
    Static<typeof ChangeEmailResponse>
  >(app, changeEmailApiRoute(), ChangeEmailRequest, changeEmail);

  installApiRoute<
    Static<typeof DeleteUserRequest>,
    Static<typeof DeleteUserResponse>
  >(app, deleteUserApiRoute(), DeleteUserRequest, deleteUser);

  installApiRoute<
    Static<typeof GetHomeDataRequest>,
    Static<typeof GetHomeDataResponse>
  >(app, getHomeDataApiRoute(), GetHomeDataRequest, getHomeData);

  installApiRoute<Static<typeof InviteRequest>, Static<typeof InviteResponse>>(
    app,
    inviteApiRoute(),
    InviteRequest,
    invite,
  );

  installApiRoute<Static<typeof LogInRequest>, Static<typeof LogInResponse>>(
    app,
    logInApiRoute(),
    LogInRequest,
    logIn,
  );

  installApiRoute<Static<typeof LogOutRequest>, Static<typeof LogOutResponse>>(
    app,
    logOutApiRoute(),
    LogOutRequest,
    logOut,
  );

  installApiRoute<
    Static<typeof ProposeEmailChangeRequest>,
    Static<typeof ProposeEmailChangeResponse>
  >(
    app,
    proposeEmailChangeApiRoute(),
    ProposeEmailChangeRequest,
    proposeEmailChange,
  );

  installApiRoute<Static<typeof SignUpRequest>, Static<typeof SignUpResponse>>(
    app,
    signUpApiRoute(),
    SignUpRequest,
    signUp,
  );
}
