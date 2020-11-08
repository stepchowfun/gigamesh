import React, { FunctionComponent } from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

const orbitRadius = 64;
const orbitBorderWidth = 4;
const planetRadius = 12;
const planetOffset =
  (orbitRadius * Math.SQRT2 - orbitRadius) / Math.SQRT2 -
  planetRadius -
  orbitBorderWidth / 2;

const LoadingPageContainer = styled.div`
  width: ${orbitRadius * 2}px;
  height: ${orbitRadius * 2}px;
  position: absolute;
  top: 50%;
  left: 50%;
  animation: ${rotate} 5s linear infinite;
  border: ${orbitBorderWidth}px solid #eeeeee;
  border-radius: 50%;
  overflow: visible;

  &::after {
    display: block;
    width: ${planetRadius * 2}px;
    height: ${planetRadius * 2}px;
    position: relative;
    left: ${planetOffset}px;
    top: ${planetOffset}px;
    background-color: #cccccc;
    border: 4px solid #ffffff;
    border-radius: 50%;
    content: '';
  }
`;

const LoadingPage: FunctionComponent<{}> = () => {
  return <LoadingPageContainer />;
};

export default LoadingPage;
