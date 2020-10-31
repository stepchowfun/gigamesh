import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';

import invite from '../api/invite';
import logIn from '../api/logIn';
import logOut from '../api/logOut';
import signUp from '../api/signUp';
import {
  LogInResponsePayload,
  SignUpResponsePayload,
} from '../shared/api/schema';
import { getSessionId, setSessionId } from '../storage/storage';
import {
  logInHashPrefix,
  signUpHashPrefix,
} from '../shared/constants/constants';

enum InvitationState {
  NotSent,
  Sending,
  Sent,
}

const AppContainer = styled.div`
  width: 320px;
  margin: 64px auto;
  color: #333333;
`;

const App: FunctionComponent<{}> = () => {
  const [email, setEmail] = useState('');
  const [invitationState, setInvitationState] = useState(
    InvitationState.NotSent,
  );
  const [loggedIn, setLoggedIn] = useState(() => getSessionId() !== null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // This hash in the URL will determine if we need to take any action when the page loads.
    const { hash } = window.location;

    // Check if the user has followed a signup link.
    if (hash.startsWith(signUpHashPrefix)) {
      // Extract the log in invitation ID.
      const signUpInvitationId = hash.substring(signUpHashPrefix.length);

      // Remove the sign up invitation ID from the URL because:
      // - If the user refreshes the page, we don't want to try to sign up again.
      //   That wouldn't work anyway, since signup invitations are only valid for
      //   a single use.
      // - It's secret (until it's used, which will happen immediately).
      // - It's ugly.
      window.history.replaceState(null, '', '/');

      // Sign up.
      signUp({ signUpInvitationId })
        .then((payload) => {
          SignUpResponsePayload.match(
            (refinedPayload) => {
              setSessionId(refinedPayload.sessionId);
              setLoggedIn(true);
            },
            () => {
              // eslint-disable-next-line no-alert
              alert(
                'Unfortunately that signup link has expired. Please sign up again.',
              );
            },
          )(payload);
        })
        .catch((e: Error) => {
          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        });
    }

    // Check if the user has followed a login link.
    if (hash.startsWith(logInHashPrefix)) {
      // Extract the log in invitation ID.
      const logInInvitationId = hash.substring(logInHashPrefix.length);

      // Remove the log in invitation ID from the URL because:
      // - If the user refreshes the page, we don't want to try to log in again.
      //   That wouldn't work anyway, since log in invitations are only valid for
      //   a single use.
      // - It's secret (until it's used, which will happen immediately).
      // - It's ugly.
      window.history.replaceState(null, '', '/');

      // Log in.
      logIn({ logInInvitationId })
        .then((payload) => {
          LogInResponsePayload.match(
            (refinedPayload) => {
              setSessionId(refinedPayload.sessionId);
              setLoggedIn(true);
            },
            () => {
              // eslint-disable-next-line no-alert
              alert(
                'Unfortunately that login link has expired. Please log in again.',
              );
            },
          )(payload);
        })
        .catch((e: Error) => {
          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        });
    }
  });

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();

    setEmail(event.target.value);
  };

  const handleEmailKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (invitationState === InvitationState.NotSent && event.key === 'Enter') {
      event.preventDefault();

      setInvitationState(InvitationState.Sending);

      invite({ email })
        .then(() => {
          setEmail('');
          setInvitationState(InvitationState.Sent);
        })
        .catch((e: Error) => {
          setInvitationState(InvitationState.NotSent);

          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        });
    }
  };

  const handleLogOutClick = (): void => {
    if (!loggingOut) {
      setLoggingOut(true);

      // The `!` is safe because the "Log out" button should only be visible when
      // we have a session ID.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      logOut({ sessionId: getSessionId()! })
        .then(() => {
          setSessionId(null);
          setLoggedIn(false);
          setLoggingOut(false);
        })
        .catch((e: Error) => {
          setLoggingOut(false);

          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        });
    }
  };

  return (
    <AppContainer>
      {loggedIn ? (
        <div>
          <h2>Welcome back</h2>
          <p>
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogOutClick}
            >
              Log out
            </button>
          </p>
        </div>
      ) : (
        <div>
          <h2>Get started</h2>
          {invitationState !== InvitationState.Sent ? (
            <label>
              Email:{' '}
              <input
                type="email"
                autoComplete="email"
                placeholder="sophie@example.com"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                readOnly={invitationState !== InvitationState.NotSent}
                required
              />
            </label>
          ) : (
            <p>Check your email!</p>
          )}
        </div>
      )}
    </AppContainer>
  );
};

export default App;
