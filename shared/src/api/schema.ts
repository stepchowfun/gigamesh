import { Literal, Number, Record, Union } from 'runtypes';

// The request and response schema for sendEmail1

export const SendEmail1Request = Record({
  type: Literal('SendEmail1Request'),
  age: Number,
});

export const SendEmail1Response = Record({
  type: Literal('SendEmail1Response'),
  newAge: Number,
});

// The request and response schema for sendEmail2

export const SendEmail2Request = Record({
  type: Literal('SendEmail2Request'),
  age: Number,
});

export const SendEmail2Response = Record({
  type: Literal('SendEmail2Response'),
  newAge: Number,
});

// The general request and response schemas

export const ApiRequest = Union(SendEmail1Request, SendEmail2Request);

export const ApiResponse = Union(SendEmail1Response, SendEmail2Response);
