import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const SimplePageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 100%;
  height: 100%;
`;

const SimplePage: FunctionComponent<{}> = (props) => {
  const { children } = props;

  return <SimplePageContainer>{children}</SimplePageContainer>;
};

export default SimplePage;
