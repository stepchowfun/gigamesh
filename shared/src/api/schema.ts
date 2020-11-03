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

// The request and response schema for `logOut`

export const LogOutRequest = Record({
  type: Literal('LogOutRequest'),
  payload: Record({
    sessionId: String,
  }),
});

export const LogOutResponse = Record({
  type: Literal('LogOutResponse'),
  payload: Unknown,
});

// The request and response schema for `deleteUser`

export const DeleteUserRequest = Record({
  type: Literal('DeleteUserRequest'),
  payload: Record({
    sessionId: String,
  }),
});

export const DeleteUserResponsePayload = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
);

export const DeleteUserResponse = Record({
  type: Literal('DeleteUserResponse'),
  payload: DeleteUserResponsePayload,
});

// The request and response schema for `requestChangeEmail`

export const RequestChangeEmailRequest = Record({
  type: Literal('RequestChangeEmailRequest'),
  payload: Record({
    sessionId: String,
    newEmail: String,
  }),
});

export const RequestChangeEmailResponsePayload = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
);

export const RequestChangeEmailResponse = Record({
  type: Literal('RequestChangeEmailResponse'),
  payload: RequestChangeEmailResponsePayload,
});

// The request and response schema for `changeEmail`

export const ChangeEmailRequest = Record({
  type: Literal('ChangeEmailRequest'),
  payload: Record({
    sessionId: String,
    changeEmailInvitationId: String,
  }),
});

export const ChangeEmailResponsePayload = Union(
  Record({
    type: Literal('Success'),
  }),
  Record({
    type: Literal('NotLoggedIn'),
  }),
  Record({
    type: Literal('InvitationExpiredOrInvalid'),
  }),
);

export const ChangeEmailResponse = Record({
  type: Literal('ChangeEmailResponse'),
  payload: ChangeEmailResponsePayload,
});

// The general request and response schemata

// The order of the request types here must match any references to
// [tag:request_type_union_order].
export const PostRequest = Union(
  InviteRequest,
  SignUpRequest,
  LogInRequest,
  LogOutRequest,
  DeleteUserRequest,
  RequestChangeEmailRequest,
  ChangeEmailRequest,
);

export const PostResponse = Union(
  InviteResponse,
  SignUpResponse,
  LogInResponse,
  LogOutResponse,
  DeleteUserResponse,
  RequestChangeEmailResponse,
  ChangeEmailResponse,
);
