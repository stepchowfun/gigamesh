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

const containerPadding = 16;
const maxInnerWidth = 400;

const Container = styled.div`
  padding: ${containerPadding}px;
  color: #333333;
`;

const Heading = styled.h2`
  max-width: 512px;
  margin: 64px auto;
  line-height: 1;
  text-align: center;

  font-size: 64px;

  @media (max-width: ${maxInnerWidth + containerPadding * 2 - 1}px) {
    font-size: 48px;
  }
`;

const InviteFormCompleted = styled.div`
  text-align: center;
`;

const inviteFormHeight = 64;
const inviteFormBorderWidth = 2;
const inviteFormPaddingWidth = 8;
const inviteFormInnerHeight =
  inviteFormHeight - inviteFormBorderWidth * 2 - inviteFormPaddingWidth * 2;

const InviteForm = styled.form`
  display: flex;
  max-width: ${maxInnerWidth}px;
  height: ${inviteFormHeight}px;
  overflow: hidden;
  margin: 0 auto;
  padding: ${inviteFormPaddingWidth}px;
  border: ${inviteFormBorderWidth}px solid #eee;
  border-radius: ${inviteFormHeight / 2}px;
  background-color: #ffffff;
`;

const Email = styled.label`
  flex-grow: 100;
`;

const inviteFormEmailLabelHeight = 16;
const inviteFormLeftPadding = inviteFormInnerHeight / 2;

const EmailLabel = styled.div`
  width: 100%;
  height: ${inviteFormEmailLabelHeight}px;
  padding-left: ${inviteFormLeftPadding}px;
  font-size: 13px;
  font-weight: bold;
`;

const emailInputHeight = inviteFormInnerHeight - inviteFormEmailLabelHeight;

const EmailInput = styled.input`
  display: block;
  width: 100%;
  height: ${emailInputHeight}px;
  padding: 0 0 0 ${inviteFormLeftPadding}px;
  border: none;
  outline: none;

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    box-shadow: inset 0 0 0 ${Math.ceil(emailInputHeight / 2)}px #ffffff;
  }
`;

const InviteSubmit = styled.button`
  display: block;
  width: ${inviteFormInnerHeight}px;
  height: ${inviteFormInnerHeight}px;
  padding: 0;
  line-height: ${inviteFormInnerHeight}px;
  border: none;
  border-radius: ${inviteFormInnerHeight / 2}px;
  outline: none;
  color: #ffffff;
  cursor: pointer;

  background-color: #92c3ff;

  &:hover {
    background-color: #b5d6ff;
  }
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
    <Container>
      <Heading>A home for all your notes.</Heading>
      {state.type === 'Sent' ? (
        <InviteFormCompleted>Check your email!</InviteFormCompleted>
      ) : (
        <InviteForm onSubmit={handleSubmit}>
          <Email>
            <EmailLabel>Email</EmailLabel>
            <EmailInput
              type="email"
              autoComplete="email"
              placeholder="me@example.com"
              value={state.email}
              onChange={handleChangeEmail}
              readOnly={state.type === 'Sending'}
              required
            />
          </Email>
          <InviteSubmit type="submit" disabled={state.type === 'Sending'}>
            Go
          </InviteSubmit>
        </InviteForm>
      )}
    </Container>
  );
};

export default LandingPage;
