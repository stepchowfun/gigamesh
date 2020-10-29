import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import invite from '../api/invite';

const AppContainer = styled.div`
  width: 320px;
  margin: 64px auto;
  color: #333333;
`;

const App: FunctionComponent<{}> = () => {
  const [email, setEmail] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();

    setEmail(event.target.value);
  };

  const handleInviteSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    setSubmittingInvite(true);

    invite({ email })
      .then(() => {
        setEmail('');
        setSubmittingInvite(false);
      })
      .catch((reason) => {
        // eslint-disable-next-line no-alert
        alert(reason);
      });
  };

  return (
    <AppContainer>
      <form onSubmit={handleInviteSubmit}>
        <h2>Get started</h2>
        <label>
          Email:{' '}
          <input
            type="email"
            placeholder="sophie@example.com"
            value={email}
            onChange={handleEmailChange}
            disabled={submittingInvite}
            required
          />
        </label>
      </form>
    </AppContainer>
  );
};

export default App;
