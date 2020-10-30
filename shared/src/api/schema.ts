import { Literal, String, Record, Union } from 'runtypes';

// The request and response schema for `invite`

export const InviteRequest = Record({
  type: Literal('InviteRequest'),
  email: String,
});

export const InviteResponse = Record({
  type: Literal('InviteResponse'),
});

// The request and response schema for `signUp`

export const SignUpRequest = Record({
  type: Literal('SignUpRequest'),
  signUpToken: String,
});

export const SignUpResponse = Record({
  type: Literal('SignUpResponse'),
  sessionToken: String,
});

// The general request and response schemas

export const PostRequest = Union(InviteRequest, SignUpRequest);

export const PostResponse = Union(InviteResponse, SignUpResponse);
