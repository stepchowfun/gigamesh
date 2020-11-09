import { isProduction } from '../shared/constants/constants';

// This is used when making API calls to the backend.
export function apiBaseUrl(): string {
  if (isProduction()) {
    return 'https://api.gigamesh.io';
  }

  return 'http://localhost:8081';
}

// Some colors used throughout the UI
export const buttonActiveColor = '#0c8fec';
export const buttonDefaultColor = '#31a3f5';
export const buttonHoverColor = '#56b8ff';
export const lineDarkColor = '#444444';
export const lineDarkerColor = '#222222';
export const lineFocusColor = buttonHoverColor;
export const lineLightColor = '#999999';
export const lineLighterColor = '#cccccc';
