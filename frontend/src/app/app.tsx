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
  const [submittingEmail, setSubmittingEmail] = useState(false);

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();

    setEmail(event.target.value);
  };

  const handleEmailKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === 'Enter' && !submittingEmail) {
      event.preventDefault();

      setSubmittingEmail(true);

      invite({ email })
        .then(() => {
          setEmail('');
          setSubmittingEmail(false);
        })
        .catch((reason) => {
          setSubmittingEmail(false);

          // eslint-disable-next-line no-alert
          alert(reason);
        });
    }
  };

  return (
    <AppContainer>
      <h2>Get started</h2>
      <label>
        Email:{' '}
        <input
          type="email"
          autoComplete="email"
          placeholder="sophie@example.com"
          value={email}
          onChange={handleEmailChange}
          onKeyDown={handleEmailKeyDown}
          readOnly={submittingEmail}
          required
        />
      </label>
    </AppContainer>
  );
};

export default App;
