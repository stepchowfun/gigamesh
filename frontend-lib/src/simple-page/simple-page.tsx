import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import { minPageWidth } from '../constants/constants';

const SimplePageContainer = styled.div`
  min-width: ${minPageWidth}px;
  padding: 32px;
  text-align: center;
`;

const SimplePage: FunctionComponent<{}> = (props) => {
  const { children } = props;

  return <SimplePageContainer>{children}</SimplePageContainer>;
};

export default SimplePage;
