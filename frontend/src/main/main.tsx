import React, { FunctionComponent, useEffect, useState } from 'react';
import { Static } from 'runtypes';

import LandingPage from '../landing_page/landing_page';
import LoadingPage from '../loading_page/loading_page';
import App from '../app/app';
import changeEmail from '../api/changeEmail';
import getUser from '../api/getUser';
import logIn from '../api/logIn';
import signUp from '../api/signUp';
import {
  ChangeEmailResponsePayload,
  GetUserResponsePayload,
  LogInResponsePayload,
  SignUpResponsePayload,
  User,
} from '../shared/api/schema';
import {
  changeEmailHashPrefix,
  logInHashPrefix,
  signUpHashPrefix,
} from '../shared/constants/constants';
import { didNotCancel, useCancel } from '../use_cancel/use_cancel';

const sessionIdKey = 'sessionId';

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

type MainState = Loading | NotLoggedIn | LoggedIn;

const Main: FunctionComponent<{}> = () => {
  // This is used to cancel any requests if the component is destroyed.
  const cancelToken = useCancel();

  // Start out in the loading state.
  const [appState, setMainState] = useState<MainState>({ type: 'Loading' });

  // This function should be called whenever we discover that the user is
  // logged in.
  const onLogIn = (sessionId: string, user: Static<typeof User>) => {
    try {
      window.localStorage.setItem(sessionIdKey, sessionId);
    } catch (_) {
      // An error might occur if the storage is full. Note that in Mobile
      // Safari, the storage is always full in private mode. If we cannot
      // persist the session ID, then the application will continue to work as
      // long as the page is open, but the user may need to re-authenticate if
      // they page is reloaded.
    }

    setMainState({
      type: 'LoggedIn',
      sessionId,
      user,
    });
  };

  // This function should be called whenever we discover that the user is
  // logged out.
  const onLogOut = () => {
    window.localStorage.removeItem(sessionIdKey);

    setMainState({ type: 'NotLoggedIn' });
  };

  useEffect(() => {
    // Did we just start loading the page?
    if (appState.type === 'Loading') {
      // Fetch the session ID, if there is one.
      const sessionId = window.localStorage.getItem(sessionIdKey);

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
                onLogIn(sessionId, refinedPayload.user);
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
                onLogIn(refinedPayload.sessionId, refinedPayload.user);
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
                onLogIn(refinedPayload.sessionId, refinedPayload.user);
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
                  onLogIn(sessionId, refinedPayload.user);

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
        <App
          sessionId={appState.sessionId}
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

export default Main;
