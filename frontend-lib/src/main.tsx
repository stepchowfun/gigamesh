import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import GlobalStyles from './global-styles/global-styles';

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

const Main: FunctionComponent<{ bootstrapData: BootstrapData }> = ({
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

export default Main;
