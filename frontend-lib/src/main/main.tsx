import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import GlobalStyles from '../global-styles/global-styles';

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

export type BootstrapData = number | null;

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 100%;
  height: 100%;
  font-size: 40px;
  color: #f8ff99;
  background: linear-gradient(20deg, rgb(219, 112, 147), #daa357);
`;

export const Main: FunctionComponent<{ bootstrapData: BootstrapData }> = ({
  bootstrapData,
}) => {
  return (
    <React.StrictMode>
      <GlobalStyles />
      {bootstrapData === null ? (
        <AppContainer>That page does not exist.</AppContainer>
      ) : (
        <AppContainer>Here’s a number: {bootstrapData}.</AppContainer>
      )}
    </React.StrictMode>
  );
};
