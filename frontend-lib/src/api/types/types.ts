import { Literal, String, Record, Union } from 'runtypes';

// This struct represents a user and is used by several APIs below.

export const User = Record({
  email: String,
});

// The request and response schema for `invite`

export const InviteRequest = Record({
  email: String,
});

export const InviteResponse = Record({});

// The request and response schema for `signUp`

export const SignUpRequest = Record({
  signupProposalId: String,
});

export const SignUpResponse = Union(
  Record({
    type: Literal('Success'),
    user: User,
  }),
  Record({
    type: Literal('ProposalExpiredOrInvalid'),
  }),
);

// The request and response schema for `logIn`

export const LogInRequest = Record({
  loginProposalId: String,
});

export const LogInResponse = Union(
  Record({
    type: Literal('Success'),
    user: User,
  }),
  Record({
    type: Literal('ProposalExpiredOrInvalid'),
  }),
);

// The request and response schema for `logOut`

export const LogOutRequest = Record({});

export const LogOutResponse = Record({});

// The request and response schema for `deleteUser`

export const DeleteUserRequest = Record({});

export const DeleteUserResponse = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
);

// The request and response schema for `proposeEmailChange`

export const ProposeEmailChangeRequest = Record({
  newEmail: String,
});

export const ProposeEmailChangeResponse = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
);

// The request and response schema for `changeEmail`

export const ChangeEmailRequest = Record({
  emailChangeProposalId: String,
});

export const ChangeEmailResponse = Union(
  Record({
    type: Literal('Success'),
    user: User,
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
  Record({
    type: Literal('ProposalExpiredOrInvalid'),
  }),
);

// The request and response schema for `getUser`

export const GetUserRequest = Record({});

export const GetUserResponse = Union(
  Record({
    type: Literal('Success'),
    user: User,
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
);
