import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import chevron from './chevron.svg';
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

const darkLine = '#444444';
const darkerLine = '#222222';
const lightLine = '#999999';
const lighterLine = '#cccccc';
const buttonColor = '#31a3f5';
const buttonColorHover = '#56b8ff';
const buttonColorActive = '#0c8fec';
const formOutlineColor = buttonColorHover;

const wobble = keyframes`
    from {
      background-position-x: 0%;
    }

    50% {
      background-position-x: 100%;
    }

    to {
      background-position-x: 0%;
    }
`;

const containerPadding = 16;
const maxInnerWidth = 400;

const Container = styled.div`
  padding: ${containerPadding}px;
`;

const Heading = styled.h2`
  max-width: 512px;
  margin: 64px auto;
  line-height: 1;
  text-align: center;
  color: ${darkerLine};

  font-size: 64px;

  @media (max-width: ${maxInnerWidth + containerPadding * 2 - 1}px) {
    font-size: 48px;
  }
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
  border-radius: ${inviteFormHeight / 2}px;
  cursor: text;

  border: ${inviteFormBorderWidth}px solid ${lighterLine};

  &:focus-within {
    border: ${inviteFormBorderWidth}px solid ${formOutlineColor};
  }
`;

const Email = styled.label`
  flex-grow: 100;
`;

const emailInputHeight = inviteFormInnerHeight / 2;
const inviteFormLeftPadding = inviteFormInnerHeight / 2;

const EmailLabel = styled.div`
  width: 100%;
  height: ${emailInputHeight}px;
  line-height: ${emailInputHeight}px;
  padding-left: ${inviteFormLeftPadding}px;
  font-size: 13px;
  font-weight: bold;
  color: ${darkLine};
  cursor: text;
`;

const EmailInput = styled.input`
  display: block;
  width: 100%;
  height: ${emailInputHeight}px;
  line-height: ${emailInputHeight}px;
  padding: 0 0 0 ${inviteFormLeftPadding}px;
  border: none;
  outline: none;
  color: ${darkLine};

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    box-shadow: inset 0 0 0 ${Math.ceil(emailInputHeight / 2)}px #ffffff;
  }

  &::placeholder {
    color: ${lightLine};
    opacity: 1;
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
  cursor: pointer;

  background-color: ${buttonColor};

  &:focus,
  &:hover {
    background-color: ${buttonColorHover};
  }

  &:active {
    background-color: ${buttonColorActive};
  }
`;

const InviteSubmitIcon = styled.img`
  display: block;
`;

const InviteFormSubmitting = styled.div`
  max-width: ${maxInnerWidth}px;
  height: ${inviteFormHeight}px;
  line-height: ${inviteFormHeight}px;
  margin: 0 auto;
  border: ${inviteFormBorderWidth}px solid ${formOutlineColor};
  border-radius: ${inviteFormHeight / 2}px;
  background: linear-gradient(270deg, #ffffff, ${formOutlineColor}, #ffffff);
  background-size: 200% 100%;
  animation: ${wobble} 1s ease-in-out infinite;
`;

const InviteFormCompleted = styled.div`
  max-width: ${maxInnerWidth}px;
  height: ${inviteFormHeight}px;
  line-height: ${inviteFormHeight}px;
  margin: 0 auto;
  border: ${inviteFormBorderWidth}px solid ${formOutlineColor};
  border-radius: ${inviteFormHeight / 2}px;
  text-align: center;
  color: ${buttonColor};
`;

const LandingPage: FunctionComponent<{}> = () => {
  const cancelToken = useCancel();
  const [state, setState] = useState<State>({ type: 'NotSent', email: '' });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  });

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

  const handleClick = (): void => {
    if (state.type === 'NotSent') {
      inputRef.current?.focus();
    }
  };

  let inviteForm;
  if (state.type === 'Sent') {
    inviteForm = <InviteFormCompleted>Check your email!</InviteFormCompleted>;
  } else if (state.type === 'Sending') {
    inviteForm = <InviteFormSubmitting />;
  } else {
    inviteForm = (
      <div>
        <InviteForm onSubmit={handleSubmit} onClick={handleClick}>
          <Email>
            <EmailLabel>Email</EmailLabel>
            <EmailInput
              ref={inputRef}
              type="email"
              autoComplete="email"
              placeholder="me@example.com"
              value={state.email}
              onChange={handleChangeEmail}
              required
            />
          </Email>
          <InviteSubmit type="submit">
            <InviteSubmitIcon src={chevron} alt="Go" />
          </InviteSubmit>
        </InviteForm>
      </div>
    );
  }

  return (
    <Container>
      <Heading>A home for all your notes.</Heading>
      {inviteForm}
    </Container>
  );
};

export default LandingPage;
