// eslint-disable-next-line import/prefer-default-export
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
