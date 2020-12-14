import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Static } from 'runtypes';

import GlobalStyles from '../global-styles/global-styles';
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

const AppContainer = styled.div`
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
  return (
    <React.StrictMode>
      <GlobalStyles />
      {bootstrapData.type === 'PageNotFound' ? (
        <AppContainer>That page does not exist.</AppContainer>
      ) : (
        <AppContainer>Hello, World!</AppContainer>
      )}
    </React.StrictMode>
  );
};
