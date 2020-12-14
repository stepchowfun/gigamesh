import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const MissingPageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 100%;
  height: 100%;
`;

const MissingPage: FunctionComponent<{}> = () => (
  <MissingPageContainer>That page does not exist.</MissingPageContainer>
);

export default MissingPage;
