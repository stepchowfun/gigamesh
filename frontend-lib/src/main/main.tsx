import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Static } from 'runtypes';

import GlobalStyles from '../global-styles/global-styles';
import HomePage from '../home-page/home-page';
import LandingPage from '../landing-page/landing-page';
import SimplePage from '../simple-page/simple-page';
import UnreachableCaseError from '../unreachable-case-error/unreachable-case-error';
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
} from '../routes/routes';

export { default as UnreachableCaseError } from '../unreachable-case-error/unreachable-case-error';

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
      page = <SimplePage>That page doesn’t exist.</SimplePage>;
      break;
    case 'BootstrapLandingPage':
      page = <LandingPage />;
      break;
    case 'BootstrapRedirectToHomePage':
      page = <SimplePage>Redirecting…</SimplePage>;
      break;
    case 'BootstrapHomePage':
      page = <HomePage />;
      break;
    default:
      throw new UnreachableCaseError(bootstrapData);
  }

  return (
    <React.StrictMode>
      <GlobalStyles />
      {page}
    </React.StrictMode>
  );
};
