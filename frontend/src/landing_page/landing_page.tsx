import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';

import invite from '../api/invite';
import { didNotCancel, useCancel } from '../use_cancel/use_cancel';

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

export default LandingPage;
