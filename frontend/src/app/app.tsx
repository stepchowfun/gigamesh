import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import invite from '../api/invite';

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
        .catch((reason: Error) => {
          setInvitationState(InvitationState.NotSent);

          // eslint-disable-next-line no-alert
          alert(`Something went wrong.\n\n${reason.toString()}`);
        });
    }
  };

  return (
    <AppContainer>
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
    </AppContainer>
  );
};

export default App;
