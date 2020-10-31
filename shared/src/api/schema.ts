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

export const SignUpResponse = Record({
  type: Literal('SignUpResponse'),
  payload: Union(
    Record({
      type: Literal('SignUpSuccessful'),
      sessionId: String,
    }),
    Record({
      type: Literal('InvitationExpiredOrInvalid'),
    }),
    Record({
      type: Literal('UserAlreadyExists'),
    }),
  ),
});

// The general request and response schemas

export const PostRequest = Union(InviteRequest, SignUpRequest);

export const PostResponse = Union(InviteResponse, SignUpResponse);
