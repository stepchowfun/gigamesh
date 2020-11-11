export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function apiBaseUrl(): string {
  if (isProduction()) {
    return 'https://api.gigamesh.io';
  }

  return 'http://localhost:8081';
}

export const logInHashPrefix = '#log-in-';
export const signUpHashPrefix = '#sign-up-';
export const changeEmailHashPrefix = '#change-email-';

export const buttonActiveColor = '#0c8fec';
export const buttonDefaultColor = '#31a3f5';
export const buttonHoverColor = '#56b8ff';
export const lineDarkColor = '#444444';
export const lineDarkerColor = '#222222';
export const lineFocusColor = buttonHoverColor;
export const lineLightColor = '#999999';
export const lineLighterColor = '#cccccc';
