export function rootRoute(): string {
  return '/';
}

export function signUpRoute(signupProposalId: string): string {
  return `/sign-up/${signupProposalId}`;
}

export function logInRoute(loginProposalId: string): string {
  return `/log-in/${loginProposalId}`;
}

export function inviteRoute(): string {
  return '/api/invite';
}
