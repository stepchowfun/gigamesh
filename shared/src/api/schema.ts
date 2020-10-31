import { Literal, String, Record, Union, Unknown } from 'runtypes';

// The request and response schema for `invite`

export const InviteRequest = Record({
  type: Literal('InviteRequest'),
  payload: Record({
    email: String,
  }),
});

export const InviteResponse = Record({
  type: Literal('InviteResponse'),
  payload: Unknown,
});

// The request and response schema for `signUp`

export const SignUpRequest = Record({
  type: Literal('SignUpRequest'),
  payload: Record({
    signUpInvitationId: String,
  }),
});

export const SignUpResponsePayload = Union(
  Record({
    type: Literal('Success'),
    sessionId: String,
  }),
  Record({
    type: Literal('InvitationExpiredOrInvalid'),
  }),
);

export const SignUpResponse = Record({
  type: Literal('SignUpResponse'),
  payload: SignUpResponsePayload,
});

// The request and response schema for `logIn`

export const LogInRequest = Record({
  type: Literal('LogInRequest'),
  payload: Record({
    logInInvitationId: String,
  }),
});

export const LogInResponsePayload = Union(
  Record({
    type: Literal('Success'),
    sessionId: String,
  }),
  Record({
    type: Literal('InvitationExpiredOrInvalid'),
  }),
);

export const LogInResponse = Record({
  type: Literal('LogInResponse'),
  payload: LogInResponsePayload,
});

// The general request and response schemas

// The order of the request types here must match any references to
// [tag:request_type_union_order].
export const PostRequest = Union(InviteRequest, SignUpRequest, LogInRequest);

export const PostResponse = Union(
  InviteResponse,
  SignUpResponse,
  LogInResponse,
);
