import React, { FunctionComponent, useEffect } from 'react';
import { Static } from 'runtypes';

import GlobalStyles from '../global-styles/global-styles';
import LandingPage from '../landing-page/landing-page';
import MissingPage from '../missing-page/missing-page';
import { User } from '../api/types/types';

export {
  ChangeEmailRequest,
  ChangeEmailResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserRequest,
  GetUserResponse,
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
      window.location.replace('/');
    }
  });

  let page;

  switch (bootstrapData.type) {
    case 'PageNotFound':
      page = <MissingPage />;
      break;
    case 'NotLoggedIn':
      page = <LandingPage />;
      break;
    case 'SignedUp':
      page = <div>Welcome back! Redirecting…</div>;
      break;
    case 'LoggedIn':
      page = <div>Welcome back!</div>;
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
