const sessionIdItem = 'sessionId';
let sessionId = window.localStorage.getItem(sessionIdItem);

export function getSessionId(): string | null {
  return sessionId;
}

export function setSessionId(id: string | null): void {
  sessionId = id;

  try {
    if (sessionId === null) {
      window.localStorage.removeItem(sessionIdItem);
    } else {
      window.localStorage.setItem(sessionIdItem, sessionId);
    }
  } catch (_) {
    // An error might occur if the storage is full. Note that in Mobile Safari,
    // the storage is always full in private mode. If we cannot persist the
    // session ID, then the application will continue to work as long as the
    // page is open, but the user may need to re-authenticate if they page is
    // reloaded.
  }
}
