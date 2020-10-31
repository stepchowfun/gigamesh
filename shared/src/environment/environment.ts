export default function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
