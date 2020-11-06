import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';

import invite from '../api/invite';
import { didNotCancel, useCancel } from '../use_cancel/use_cancel';

interface NotSent {
  type: 'NotSent';
  email: string;
}

interface Sending {
  type: 'Sending';
  email: string;
}

interface Sent {
  type: 'Sent';
}

type State = NotSent | Sending | Sent;

const LandingPageContainer = styled.div`
  width: 480px;
  margin: 64px auto;
  color: #333333;
`;

const LandingPage: FunctionComponent<{}> = () => {
  const cancelToken = useCancel();
  const [state, setState] = useState<State>({ type: 'NotSent', email: '' });

  const handleChangeEmail = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (state.type === 'NotSent') {
      setState({ ...state, email: event.target.value });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    if (state.type === 'NotSent') {
      event.preventDefault();

      setState({ type: 'Sending', email: state.email });

      invite({ email: state.email }, cancelToken)
        .then(() => {
          setState({ type: 'Sent' });
        })
        .catch((e: Error) => {
          if (didNotCancel(e)) {
            setState({ type: 'NotSent', email: state.email });

            // eslint-disable-next-line no-alert
            alert(`Something went wrong.\n\n${e.toString()}`);
          }
        });
    }
  };

  return (
    <LandingPageContainer>
      <h2>Welcome to Gigamesh!</h2>
      {state.type === 'Sent' ? (
        <p>Check your email!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Email:{' '}
            <input
              type="email"
              autoComplete="email"
              placeholder="sophie@example.com"
              value={state.email}
              onChange={handleChangeEmail}
              readOnly={state.type === 'Sending'}
              required
            />
          </label>{' '}
          <button type="submit" disabled={state.type === 'Sending'}>
            Get started
          </button>
        </form>
      )}
    </LandingPageContainer>
  );
};

export default LandingPage;
