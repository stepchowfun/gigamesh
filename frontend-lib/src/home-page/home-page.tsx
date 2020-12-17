import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';

import UnreachableCaseError from '../unreachable-case-error/unreachable-case-error';
import deleteUser from '../api/endpoints/delete-user/delete-user';
import logOut from '../api/endpoints/log-out/log-out';
import proposeEmailChange from '../api/endpoints/propose-email-change/propose-email-change';
import { didNotCancel, useCancel } from '../use-cancel/use-cancel';
import { rootWebRoute } from '../routes/routes';

const Container = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const HomePage: FunctionComponent<{}> = () => {
  const cancelToken = useCancel();
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleChangeNewEmail = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewEmail(event.target.value);
  };

  const handleChangeEmailSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    if (!updatingSettings) {
      event.preventDefault();

      setUpdatingSettings(true);

      proposeEmailChange({ newEmail }, cancelToken)
        .then((response) => {
          setUpdatingSettings(false);

          switch (response.type) {
            case 'Success':
              setNewEmail('');

              // eslint-disable-next-line no-alert
              alert('Please check your email to confirm the change.');

              break;
            case 'NotLoggedIn':
              // eslint-disable-next-line no-alert
              alert('You are not logged in. Please log in and try again.');
              break;
            default:
              throw new UnreachableCaseError(response);
          }
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

  const handleLogOutClick = (): void => {
    if (!updatingSettings) {
      setUpdatingSettings(true);

      logOut({}, cancelToken)
        .then(() => {
          window.location.replace(rootWebRoute());
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

  const handleDeleteUserClick = (): void => {
    if (!updatingSettings) {
      // eslint-disable-next-line no-alert
      if (window.confirm('Are you sure you want to delete your account?')) {
        setUpdatingSettings(true);

        deleteUser({}, cancelToken)
          .then((response) => {
            switch (response.type) {
              case 'Success':
                window.location.replace(rootWebRoute());
                break;
              case 'NotLoggedIn':
                // eslint-disable-next-line no-alert
                alert('You are not logged in. Please log in and try again.');
                break;
              default:
                throw new UnreachableCaseError(response);
            }
          })
          .catch((e: Error) => {
            if (didNotCancel(e)) {
              setUpdatingSettings(false);

              // eslint-disable-next-line no-alert
              alert(`Something went wrong.\n\n${e.toString()}`);
            }
          });
      }
    }
  };

  return (
    <Container>
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
          onClick={handleLogOutClick}
        >
          Log out
        </button>{' '}
      </p>
      <p>
        <button
          type="button"
          disabled={updatingSettings}
          onClick={handleDeleteUserClick}
        >
          Delete account
        </button>
      </p>
    </Container>
  );
};

export default HomePage;
