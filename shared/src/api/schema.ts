import { InstanceOf, Literal, Number, Record, Union } from 'runtypes';

// The request and response schema for emailDemo

export const EmailDemoRequest = Record({
  type: Literal('EmailDemoRequest'),
  age: Number,
});

export const EmailDemoResponse = Record({
  type: Literal('EmailDemoResponse'),
  newAge: Number,
});

// The request and response schema for storageDemo

export const StorageDemoRequest = Record({
  type: Literal('StorageDemoRequest'),
});

export const StorageDemoResponse = Record({
  type: Literal('StorageDemoResponse'),
  now: InstanceOf(Date),
});

// The general request and response schemas

export const PostRequest = Union(EmailDemoRequest, StorageDemoRequest);

export const PostResponse = Union(EmailDemoResponse, StorageDemoResponse);
