import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Static } from 'runtypes';

import GlobalStyles from '../global-styles/global-styles';
import LandingPage from '../landing-page/landing-page';
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

export interface LoggedIn {
  type: 'LoggedIn';
  user: Static<typeof User>;
}

export type BootstrapData = PageNotFound | NotLoggedIn | LoggedIn;

const PageNotFoundContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 100%;
  height: 100%;
`;

export const Main: FunctionComponent<{ bootstrapData: BootstrapData }> = ({
  bootstrapData,
}) => {
  let page;

  switch (bootstrapData.type) {
    case 'PageNotFound':
      page = (
        <PageNotFoundContainer>That page does not exist.</PageNotFoundContainer>
      );
      break;
    case 'NotLoggedIn':
      page = <LandingPage />;
      break;
    case 'LoggedIn':
      page = <LandingPage />;
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
