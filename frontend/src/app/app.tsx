import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Static } from 'runtypes';

import changeEmail from '../api/changeEmail';
import deleteUser from '../api/deleteUser';
import getUser from '../api/getUser';
import invite from '../api/invite';
import logIn from '../api/logIn';
import logOut from '../api/logOut';
import proposeEmailChange from '../api/proposeEmailChange';
import signUp from '../api/signUp';
import {
  ChangeEmailResponsePayload,
  DeleteUserResponsePayload,
  GetUserResponsePayload,
  LogInResponsePayload,
  ProposeEmailChangeResponsePayload,
  SignUpResponsePayload,
  User,
} from '../shared/api/schema';
import {
  changeEmailHashPrefix,
  logInHashPrefix,
  signUpHashPrefix,
} from '../shared/constants/constants';
import { getSessionId, setSessionId } from '../storage/storage';
import { didNotCancel, useCancel } from '../use_cancel/use_cancel';

const LoadingPageContainer = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const LoadingPage: FunctionComponent<{}> = () => {
  return <LoadingPageContainer>Loading...</LoadingPageContainer>;
};

enum ProposalState {
  NotSent,
  Sending,
  Sent,
}

const LandingPageContainer = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const LandingPage: FunctionComponent<{}> = () => {
  const cancelToken = useCancel();
  const [email, setEmail] = useState('');
  const [proposalState, setProposalState] = useState(ProposalState.NotSent);

  const handleChangeEmail = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();

    setEmail(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    if (proposalState === ProposalState.NotSent) {
      event.preventDefault();

      setProposalState(ProposalState.Sending);

      invite({ email }, cancelToken)
        .then(() => {
          setEmail('');
          setProposalState(ProposalState.Sent);
        })
        .catch((e: Error) => {
          if (didNotCancel(e)) {
            setProposalState(ProposalState.NotSent);

            // eslint-disable-next-line no-alert
            alert(`Something went wrong.\n\n${e.toString()}`);
          }
        });
    }
  };

  return (
    <LandingPageContainer>
      <h2>Welcome to Gigamesh!</h2>
      {proposalState !== ProposalState.Sent ? (
        <form onSubmit={handleSubmit}>
          <label>
            Email:{' '}
            <input
              type="email"
              autoComplete="email"
              placeholder="sophie@example.com"
              value={email}
              onChange={handleChangeEmail}
              readOnly={proposalState !== ProposalState.NotSent}
              required
            />
          </label>{' '}
          <button
            type="submit"
            disabled={proposalState !== ProposalState.NotSent}
          >
            Get started
          </button>
        </form>
      ) : (
        <p>Check your email!</p>
      )}
    </LandingPageContainer>
  );
};

const MainPageContainer = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const MainPage: FunctionComponent<{
  sessionId: string;
  user: Static<typeof User>;
  onLogOut: () => void;
}> = ({ sessionId, user, onLogOut }) => {
  const cancelToken = useCancel();
  const [newEmail, setNewEmail] = useState('');
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const handleLogOutClick = (): void => {
    if (!updatingSettings) {
      setUpdatingSettings(true);

      logOut({ sessionId }, cancelToken)
        .then(onLogOut)
        .catch((e: Error) => {
          if (didNotCancel(e)) {
            setUpdatingSettings(false);

            // eslint-disable-next-line no-alert
            alert(`Something went wrong.\n\n${e.toString()}`);
          }
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

      proposeEmailChange({ sessionId, newEmail }, cancelToken)
        .then((payload) => {
          ProposeEmailChangeResponsePayload.match(
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
          if (didNotCancel(e)) {
            // eslint-disable-next-line no-alert
            alert(`Something went wrong.\n\n${e.toString()}`);
          }
        })
        .finally(() => {
          setUpdatingSettings(false);
        });
    }
  };

  const handleDeleteUserClick = (): void => {
    if (!updatingSettings) {
      setUpdatingSettings(true);

      deleteUser({ sessionId }, cancelToken)
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

          onLogOut();
        })
        .catch((e: Error) => {
          if (didNotCancel(e)) {
            setUpdatingSettings(false);

            // eslint-disable-next-line no-alert
            alert(`Something went wrong.\n\n${e.toString()}`);
          }
        });
    }
  };

  return (
    <MainPageContainer>
      <h2>Hello there!</h2>
      <p>Your email is: {user.email}</p>
      <p>
        <button
          type="button"
          disabled={updatingSettings}
          onClick={handleLogOutClick}
        >
          Log out
        </button>{' '}
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
      <p>
        <button
          type="button"
          disabled={updatingSettings}
          onClick={handleDeleteUserClick}
        >
          Delete account
        </button>
      </p>
    </MainPageContainer>
  );
};

interface Loading {
  type: 'Loading';
}

interface NotLoggedIn {
  type: 'NotLoggedIn';
}

interface LoggedIn {
  type: 'LoggedIn';
  sessionId: string;
  user: Static<typeof User>;
}

type AppState = Loading | NotLoggedIn | LoggedIn;

const App: FunctionComponent<{}> = () => {
  // This is used to cancel any requests if the component is destroyed.
  const cancelToken = useCancel();

  // Start out in the loading state.
  const [appState, setAppState] = useState<AppState>({ type: 'Loading' });

  // This is a convenience function for dropping the current session (e.g.,
  // because the user logged out or the session expired).
  const onLogOut = () => {
    setSessionId(null);
    setAppState({ type: 'NotLoggedIn' });
  };

  useEffect(() => {
    // Did we just start loading the page?
    if (appState.type === 'Loading') {
      // Fetch the session ID, if there is one.
      const sessionId = getSessionId();

      // This hash in the URL will determine if we need to take any action when
      // the page loads.
      const { hash } = window.location;

      // No hash?
      if (hash === '') {
        // Are we logged out?
        if (sessionId === null) {
          // Go to the landing page.
          onLogOut();
        } else {
          // Fetch the user.
          getUser({ sessionId }, cancelToken)
            .then((payload) => {
              GetUserResponsePayload.match((refinedPayload) => {
                setAppState({
                  type: 'LoggedIn',
                  sessionId,
                  user: refinedPayload.user,
                });
              }, onLogOut)(payload);
            })
            .catch((e: Error) => {
              if (didNotCancel(e)) {
                onLogOut();

                // eslint-disable-next-line no-alert
                alert(`Something went wrong.\n\n${e.toString()}`);
              }
            });
        }
      }

      // Check if the user has followed a signup link.
      if (hash.startsWith(signUpHashPrefix)) {
        // Extract the signup proposal ID.
        const signupProposalId = hash.substring(signUpHashPrefix.length);

        // Remove the signup proposal ID from the URL because:
        // - If the user refreshes the page, we don't want to try to sign up again.
        //   That wouldn't work anyway, since signup proposals are only valid for
        //   a single use.
        // - It's secret (until it's used, which will happen immediately).
        // - It's ugly.
        window.history.replaceState(null, '', '/');

        // Sign up.
        signUp({ signupProposalId }, cancelToken)
          .then((payload) => {
            SignUpResponsePayload.match(
              (refinedPayload) => {
                setSessionId(refinedPayload.sessionId);
                setAppState({
                  type: 'LoggedIn',
                  sessionId: refinedPayload.sessionId,
                  user: refinedPayload.user,
                });
              },
              () => {
                onLogOut();

                // eslint-disable-next-line no-alert
                alert('Unfortunately that link has expired.');
              },
            )(payload);
          })
          .catch((e: Error) => {
            if (didNotCancel(e)) {
              onLogOut();

              // eslint-disable-next-line no-alert
              alert(`Something went wrong.\n\n${e.toString()}`);
            }
          });
      }

      // Check if the user has followed a login link.
      if (hash.startsWith(logInHashPrefix)) {
        // Extract the login proposal ID.
        const loginProposalId = hash.substring(logInHashPrefix.length);

        // Remove the login proposal ID from the URL because:
        // - If the user refreshes the page, we don't want to try to log in again.
        //   That wouldn't work anyway, since login proposals are only valid for
        //   a single use.
        // - It's secret (until it's used, which will happen immediately).
        // - It's ugly.
        window.history.replaceState(null, '', '/');

        // Log in.
        logIn({ loginProposalId }, cancelToken)
          .then((payload) => {
            LogInResponsePayload.match(
              (refinedPayload) => {
                setSessionId(refinedPayload.sessionId);
                setAppState({
                  type: 'LoggedIn',
                  sessionId: refinedPayload.sessionId,
                  user: refinedPayload.user,
                });
              },
              () => {
                onLogOut();

                // eslint-disable-next-line no-alert
                alert('Unfortunately that link has expired.');
              },
            )(payload);
          })
          .catch((e: Error) => {
            if (didNotCancel(e)) {
              onLogOut();

              // eslint-disable-next-line no-alert
              alert(`Something went wrong.\n\n${e.toString()}`);
            }
          });
      }

      // Check if the user has followed a change email link.
      if (hash.startsWith(changeEmailHashPrefix)) {
        // Extract the change email proposal ID.
        const emailChangeProposalId = hash.substring(
          changeEmailHashPrefix.length,
        );

        // Remove the change email proposal ID from the URL because:
        // - If the user refreshes the page, we don't want to try the operation
        //   again. That wouldn't work anyway, since change email proposals are
        //   only valid for a single use.
        // - It's ugly.
        window.history.replaceState(null, '', '/');

        // Make sure we are logged in before proceeding.
        if (sessionId === null) {
          onLogOut();

          // eslint-disable-next-line no-alert
          alert('You must be logged in to perform that operation.');
        } else {
          // Change the email.
          changeEmail({ sessionId, emailChangeProposalId }, cancelToken)
            .then((payload) => {
              ChangeEmailResponsePayload.match(
                (refinedPayload) => {
                  setAppState({
                    type: 'LoggedIn',
                    sessionId,
                    user: refinedPayload.user,
                  });

                  // eslint-disable-next-line no-alert
                  alert('Your email has been updated.');
                },
                () => {
                  onLogOut();

                  // eslint-disable-next-line no-alert
                  alert('You must be logged in to perform that operation.');
                },
                () => {
                  onLogOut();

                  // eslint-disable-next-line no-alert
                  alert('Unfortunately that link has expired.');
                },
              )(payload);
            })
            .catch((e: Error) => {
              if (didNotCancel(e)) {
                onLogOut();

                // eslint-disable-next-line no-alert
                alert(`Something went wrong.\n\n${e.toString()}`);
              }
            });
        }
      }
    }
  });

  // Use the state to choose which view to render.
  switch (appState.type) {
    case 'Loading': {
      return <LoadingPage />;
    }
    case 'NotLoggedIn': {
      return <LandingPage />;
    }
    case 'LoggedIn': {
      return (
        <MainPage
          sessionId={
            // The `!` is safe because this state is active only when there is
            // a session.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            getSessionId()!
          }
          user={appState.user}
          onLogOut={onLogOut}
        />
      );
    }
    default: {
      const exhaustivenessCheck: never = appState;
      return exhaustivenessCheck;
    }
  }
};

export default App;
