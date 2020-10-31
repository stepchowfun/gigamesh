import { isProduction } from '../shared/constants/constants';

// This is used when making API calls to the backend.
export default function apiBaseUrl(): string {
  if (isProduction()) {
    return 'https://api.gigamesh.io';
  }

  return 'http://localhost:8081';
}
