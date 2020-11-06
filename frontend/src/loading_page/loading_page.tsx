import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const LoadingPageContainer = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const LoadingPage: FunctionComponent<{}> = () => {
  return <LoadingPageContainer>Loading...</LoadingPageContainer>;
};

export default LoadingPage;
