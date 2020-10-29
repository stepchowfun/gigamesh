import { InstanceOf, Literal, String, Record, Union } from 'runtypes';

// The request and response schema for `invite`

export const InviteRequest = Record({
  type: Literal('InviteRequest'),
  email: String,
});

export const InviteResponse = Record({
  type: Literal('InviteResponse'),
});

// The request and response schema for `storageDemo`

export const StorageDemoRequest = Record({
  type: Literal('StorageDemoRequest'),
});

export const StorageDemoResponse = Record({
  type: Literal('StorageDemoResponse'),
  now: InstanceOf(Date),
});

// The general request and response schemas

export const PostRequest = Union(InviteRequest, StorageDemoRequest);

export const PostResponse = Union(InviteResponse, StorageDemoResponse);
