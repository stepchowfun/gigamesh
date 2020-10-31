export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export const logInHashPrefix = '#log-in-';

export const signUpHashPrefix = '#sign-up-';
