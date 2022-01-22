import * as React from 'react';
import { FunctionComponent } from 'react';
import styled from 'styled-components';

const SimplePageContainer = styled.div`
  padding: 32px;
  text-align: center;
`;

const SimplePage: FunctionComponent<{}> = (props) => {
  const { children } = props;

  return <SimplePageContainer>{children}</SimplePageContainer>;
};

export default SimplePage;
