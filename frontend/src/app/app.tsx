import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import { Static } from 'runtypes';

import deleteUser from '../api/deleteUser';
import logOut from '../api/logOut';
import proposeEmailChange from '../api/proposeEmailChange';
import {
  DeleteUserResponsePayload,
  ProposeEmailChangeResponsePayload,
  User,
} from '../shared/api/schema';
import { didNotCancel, useCancel } from '../use_cancel/use_cancel';

const AppContainer = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const App: FunctionComponent<{
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
    <AppContainer>
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
    </AppContainer>
  );
};

export default App;
