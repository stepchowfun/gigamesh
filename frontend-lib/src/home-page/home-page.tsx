import React, { FunctionComponent, useState } from 'react';

import logOut from '../api/endpoints/log-out/log-out';
import { didNotCancel, useCancel } from '../use-cancel/use-cancel';
import { rootWebRoute } from '../routes/routes';

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

  return (
    <p>
      <button
        type="button"
        disabled={updatingSettings}
        onClick={handleLogOutClick}
      >
        Log out
      </button>{' '}
    </p>
  );
};

export default HomePage;
