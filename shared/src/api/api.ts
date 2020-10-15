import { Number, Record } from 'runtypes';

export const ApiRequest = Record({
  age: Number,
});

export const ApiResponse = Record({
  newAge: Number,
});
