import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';

import changeEmail from '../api/changeEmail';
import deleteUser from '../api/deleteUser';
import invite from '../api/invite';
import logIn from '../api/logIn';
import logOut from '../api/logOut';
import requestChangeEmail from '../api/requestChangeEmail';
import signUp from '../api/signUp';
import {
  ChangeEmailResponsePayload,
  DeleteUserResponsePayload,
  LogInResponsePayload,
  RequestChangeEmailResponsePayload,
  SignUpResponsePayload,
} from '../shared/api/schema';
import { getSessionId, setSessionId } from '../storage/storage';
import {
  changeEmailHashPrefix,
  logInHashPrefix,
  signUpHashPrefix,
} from '../shared/constants/constants';

enum InvitationState {
  NotSent,
  Sending,
  Sent,
}

const AppContainer = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const App: FunctionComponent<{}> = () => {
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [invitationState, setInvitationState] = useState(
    InvitationState.NotSent,
  );
  const [loggedIn, setLoggedIn] = useState(() => getSessionId() !== null);
  const [updatingSettings, setUpdatingSettings] = useState(false);

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
              alert('Unfortunately that link has expired.');
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
              alert('Unfortunately that link has expired.');
            },
          )(payload);
        })
        .catch((e: Error) => {
          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        });
    }

    // Check if the user has followed a change email link.
    if (hash.startsWith(changeEmailHashPrefix)) {
      // Extract the change email invitation ID.
      const changeEmailInvitationId = hash.substring(
        changeEmailHashPrefix.length,
      );

      // Remove the change email invitation ID from the URL because:
      // - If the user refreshes the page, we don't want to try the operation
      //   again. That wouldn't work anyway, since change email invitations are
      //   only valid for a single use.
      // - It's ugly.
      window.history.replaceState(null, '', '/');

      // Make sure we are logged in before proceeding.
      const sessionId = getSessionId();
      if (sessionId === null) {
        // eslint-disable-next-line no-alert
        alert('You must be logged in to perform that operation.');
      } else {
        // Change the email.
        changeEmail({ sessionId, changeEmailInvitationId })
          .then((payload) => {
            ChangeEmailResponsePayload.match(
              () => {
                // eslint-disable-next-line no-alert
                alert('Your email has been updated.');
              },
              () => {
                // eslint-disable-next-line no-alert
                alert('You must be logged in to perform that operation.');
              },
              () => {
                // eslint-disable-next-line no-alert
                alert('Unfortunately that link has expired.');
              },
            )(payload);
          })
          .catch((e: Error) => {
            // eslint-disable-next-line no-alert
            alert(`Something went wrong.\n\n${e.toString()}`);
          });
      }
    }
  });

  const handleChangeEmail = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();

    setEmail(event.target.value);
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    if (invitationState === InvitationState.NotSent) {
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
    if (!updatingSettings) {
      setUpdatingSettings(true);

      // The `!` is safe because the "Log out" button should only be visible when
      // we have a session ID.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      logOut({ sessionId: getSessionId()! })
        .then(() => {
          setSessionId(null);
          setLoggedIn(false);
        })
        .catch((e: Error) => {
          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        })
        .finally(() => {
          setUpdatingSettings(false);
        });
    }
  };

  const handleDeleteUserClick = (): void => {
    if (!updatingSettings) {
      setUpdatingSettings(true);

      // The `!` is safe because the "Delete account" button should only be
      // visible when we have a session ID.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      deleteUser({ sessionId: getSessionId()! })
        .then((payload) => {
          DeleteUserResponsePayload.match(
            () => {
              // The deletion was successful.
            },
            () => {
              // eslint-disable-next-line no-alert
              alert('You are not logged in. Please log in and try again.');
            },
          )(payload);

          setSessionId(null);
          setLoggedIn(false);
        })
        .catch((e: Error) => {
          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        })
        .finally(() => {
          setUpdatingSettings(false);
        });
    }
  };

  const handleChangeNewEmail = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();

    setNewEmail(event.target.value);
  };

  const handleChangeEmailSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    if (!updatingSettings) {
      event.preventDefault();

      setUpdatingSettings(true);

      // The `!` is safe because the "Delete account" button should only be
      // visible when we have a session ID.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      requestChangeEmail({ sessionId: getSessionId()!, newEmail })
        .then((payload) => {
          RequestChangeEmailResponsePayload.match(
            () => {
              setNewEmail('');

              // eslint-disable-next-line no-alert
              alert('Check your email!');
            },
            () => {
              // eslint-disable-next-line no-alert
              alert('You are not logged in. Please log in and try again.');
            },
          )(payload);
        })
        .catch((e: Error) => {
          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${e.toString()}`);
        })
        .finally(() => {
          setUpdatingSettings(false);
        });
    }
  };

  return (
    <AppContainer>
      {loggedIn ? (
        <div>
          <h2>Welcome back!</h2>
          <p>
            <button
              type="button"
              disabled={updatingSettings}
              onClick={handleLogOutClick}
            >
              Log out
            </button>{' '}
            <button
              type="button"
              disabled={updatingSettings}
              onClick={handleDeleteUserClick}
            >
              Delete account
            </button>
          </p>
          <form onSubmit={handleChangeEmailSubmit}>
            <label>
              New email:{' '}
              <input
                type="email"
                autoComplete="email"
                placeholder="sophie@example.com"
                value={newEmail}
                onChange={handleChangeNewEmail}
                readOnly={updatingSettings}
                required
              />
            </label>{' '}
            <button type="submit" disabled={updatingSettings}>
              Change email
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Hello there!</h2>
          {invitationState !== InvitationState.Sent ? (
            <form onSubmit={handleEmailSubmit}>
              <label>
                Email:{' '}
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="sophie@example.com"
                  value={email}
                  onChange={handleChangeEmail}
                  readOnly={invitationState !== InvitationState.NotSent}
                  required
                />
              </label>{' '}
              <button
                type="submit"
                disabled={invitationState !== InvitationState.NotSent}
              >
                Get started
              </button>
            </form>
          ) : (
            <p>Check your email!</p>
          )}
        </div>
      )}
    </AppContainer>
  );
};

export default App;
