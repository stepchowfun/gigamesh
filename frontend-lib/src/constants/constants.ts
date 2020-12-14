export const isProduction = process.env.NODE_ENV === 'production';

export const apiBaseUrl = isProduction
  ? 'https://www.gigamesh.io/api/'
  : 'http://localhost:8080/api/';

export const buttonActiveColor = '#0c8fec';
export const buttonDefaultColor = '#31a3f5';
export const buttonHoverColor = '#56b8ff';
export const lineDarkColor = '#444444';
export const lineDarkerColor = '#222222';
export const lineFocusColor = buttonHoverColor;
export const lineLightColor = '#999999';
export const lineLighterColor = '#cccccc';
