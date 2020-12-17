// Web routes (in alphabetical order)

export function changeEmailWebRoute(emailChangeProposalId: string): string {
  return `/change-email/${emailChangeProposalId}`;
}

export function logInWebRoute(loginProposalId: string): string {
  return `/log-in/${loginProposalId}`;
}

export function rootWebRoute(): string {
  return '/';
}

export function signUpWebRoute(signupProposalId: string): string {
  return `/sign-up/${signupProposalId}`;
}

// API routes (in alphabetical order)

export function changeEmailApiRoute(): string {
  return '/api/change-email';
}

export function deleteUserApiRoute(): string {
  return '/api/delete-user';
}

export function getHomeDataApiRoute(): string {
  return '/api/get-home-data';
}

export function inviteApiRoute(): string {
  return '/api/invite';
}

export function logInApiRoute(): string {
  return '/api/log-in';
}

export function logOutApiRoute(): string {
  return '/api/log-out';
}

export function proposeEmailChangeApiRoute(): string {
  return '/api/propose-email-change';
}

export function signUpApiRoute(): string {
  return '/api/sign-up';
}
