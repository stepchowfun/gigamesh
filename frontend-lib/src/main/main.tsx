import React, { FunctionComponent, useEffect } from 'react';
import { Static } from 'runtypes';

import GlobalStyles from '../global-styles/global-styles';
import LandingPage from '../landing-page/landing-page';
import SimplePage from '../simple-page/simple-page';
import { User } from '../api/types/types';
import { rootWebRoute } from '../routes/routes';

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
  getHomeDataApiRoute,
  inviteApiRoute,
  logInApiRoute,
  logInWebRoute,
  logOutApiRoute,
  rootWebRoute,
  signUpApiRoute,
  signUpWebRoute,
} from '../routes/routes';

export interface BootstrapPageNotFound {
  type: 'BootstrapPageNotFound';
}

export interface BootstrapLandingPage {
  type: 'BootstrapLandingPage';
}

export interface BootstrapRedirectToHomePage {
  type: 'BootstrapRedirectToHomePage';
}

export interface BootstrapHomePage {
  type: 'BootstrapHomePage';
  user: Static<typeof User>;
}

export type BootstrapData =
  | BootstrapPageNotFound
  | BootstrapLandingPage
  | BootstrapRedirectToHomePage
  | BootstrapHomePage;

export const Main: FunctionComponent<{ bootstrapData: BootstrapData }> = ({
  bootstrapData,
}) => {
  useEffect(() => {
    if (bootstrapData.type === 'BootstrapRedirectToHomePage') {
      window.location.replace(rootWebRoute());
    }
  });

  let page;

  switch (bootstrapData.type) {
    case 'BootstrapPageNotFound':
      page = <SimplePage>That page does not exist.</SimplePage>;
      break;
    case 'BootstrapLandingPage':
      page = <LandingPage />;
      break;
    case 'BootstrapRedirectToHomePage':
      page = <SimplePage>Redirecting…</SimplePage>;
      break;
    case 'BootstrapHomePage':
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
