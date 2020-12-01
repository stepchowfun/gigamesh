import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import GlobalStyles from './global-styles/global-styles';

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 100%;
  height: 100%;
  font-size: 40px;
  background: linear-gradient(20deg, rgb(219, 112, 147), #daa357);
`;

const Main: FunctionComponent<{}> = () => {
  return (
    <React.StrictMode>
      <GlobalStyles />
      <AppContainer>Hello!</AppContainer>
    </React.StrictMode>
  );
};

export default Main;
