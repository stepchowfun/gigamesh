import React, { FunctionComponent, useEffect } from 'react';
import { Static } from 'runtypes';

import GlobalStyles from '../global-styles/global-styles';
import LandingPage from '../landing-page/landing-page';
import SimplePage from '../simple-page/simple-page';
import { User } from '../api/types/types';
import { rootRoute } from '../routes/routes';

export {
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
  User,
} from '../api/types/types';
export {
  inviteRoute,
  logInRoute,
  rootRoute,
  signUpRoute,
} from '../routes/routes';

export interface PageNotFound {
  type: 'PageNotFound';
}

export interface NotLoggedIn {
  type: 'NotLoggedIn';
}

export interface SignedUp {
  type: 'SignedUp';
}

export interface LoggedIn {
  type: 'LoggedIn';
  user: Static<typeof User>;
}

export type BootstrapData = PageNotFound | NotLoggedIn | SignedUp | LoggedIn;

export const Main: FunctionComponent<{ bootstrapData: BootstrapData }> = ({
  bootstrapData,
}) => {
  useEffect(() => {
    if (bootstrapData.type === 'SignedUp') {
      window.location.replace(rootRoute());
    }
  });

  let page;

  switch (bootstrapData.type) {
    case 'PageNotFound':
      page = <SimplePage>That page does not exist.</SimplePage>;
      break;
    case 'NotLoggedIn':
      page = <LandingPage />;
      break;
    case 'SignedUp':
      page = <SimplePage>Welcome back! Redirecting…</SimplePage>;
      break;
    case 'LoggedIn':
      page = <SimplePage>Welcome back!</SimplePage>;
      break;
    default:
      throw new Error('Missing case in switch statement.');
  }

  return (
    <React.StrictMode>
      <GlobalStyles />
      {page}
    </React.StrictMode>
  );
};
