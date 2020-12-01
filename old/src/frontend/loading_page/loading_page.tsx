import React, { FunctionComponent } from 'react';
import styled, { keyframes } from 'styled-components';

import { buttonDefaultColor, lineLighterColor } from '../constants/constants';

const rotate = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(405deg);
  }
`;

const orbitRadius = 64;
const orbitBorderWidth = 4;
const planetRadius = 12;
const planetOffset =
  (orbitRadius * Math.SQRT2 - orbitRadius) / Math.SQRT2 -
  planetRadius -
  orbitBorderWidth / 2;

const Container = styled.div`
  width: ${orbitRadius * 2}px;
  height: ${orbitRadius * 2}px;
  position: absolute;
  top: 50%;
  left: 50%;
  animation: ${rotate} 1.5s ease infinite;
  border: ${orbitBorderWidth}px solid ${lineLighterColor};
  border-radius: 50%;
  overflow: visible;

  &::after {
    display: block;
    width: ${planetRadius * 2}px;
    height: ${planetRadius * 2}px;
    position: relative;
    left: ${planetOffset}px;
    top: ${planetOffset}px;
    background-color: ${buttonDefaultColor};
    border: 4px solid #ffffff;
    border-radius: 50%;
    content: '';
  }
`;

const LoadingPage: FunctionComponent<{}> = () => {
  return <Container />;
};

export default LoadingPage;
