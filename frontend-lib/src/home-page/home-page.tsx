import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';

import UnreachableCaseError from '../unreachable-case-error/unreachable-case-error';
import deleteUser from '../api/endpoints/delete-user/delete-user';
import logOut from '../api/endpoints/log-out/log-out';
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
