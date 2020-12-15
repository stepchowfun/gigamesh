// This interface is used as a wrapper for both requests and responses.
export interface Envelope<T> {
  payload: T;
  sessionId: string | null;
}
