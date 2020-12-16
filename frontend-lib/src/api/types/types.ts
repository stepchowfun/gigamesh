import { Literal, String, Record, Union } from 'runtypes';

// This struct represents a user and is used in several types below.

export const User = Record({
  email: String,
});

// Endpoint request and response types

export const InviteRequest = Record({
  email: String,
});

export const InviteResponse = Record({});

// Endpoint request and response types

export const SignUpRequest = Record({
  signupProposalId: String,
});

export const SignUpResponse = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('ProposalExpiredOrInvalid'),
  }),
);

// Endpoint request and response types

export const LogInRequest = Record({
  loginProposalId: String,
});

export const LogInResponse = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('ProposalExpiredOrInvalid'),
  }),
);

// Endpoint request and response types

export const GetHomeDataRequest = Record({});

export const GetHomeDataResponse = Union(
  Record({
    type: Literal('Success'),
    user: User,
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
);

// Endpoint request and response types

export const LogOutRequest = Record({});

export const LogOutResponse = Record({});

// Endpoint request and response types

export const DeleteUserRequest = Record({});

export const DeleteUserResponse = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
);

// Endpoint request and response types

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

// Endpoint request and response types

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
