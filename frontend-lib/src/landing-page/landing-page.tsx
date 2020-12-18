import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import styled, { css, keyframes } from 'styled-components';

import {
  isBrowser,
  buttonActiveColor,
  buttonDefaultColor,
  buttonHoverColor,
  lineDarkColor,
  lineDarkerColor,
  lineFocusColor,
  lineLightColor,
  lineLighterColor,
} from '../constants/constants';
import chevron from './chevron.svg';
import invite from '../api/endpoints/invite/invite';
import { didNotCancel, useCancel } from '../use-cancel/use-cancel';

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

const wobble = keyframes`
  from {
    background-position-x: 0%;
  }

  to {
    background-position-x: 100%;
  }
`;

const containerPadding = 16;

const Container = styled.div`
  padding: ${containerPadding}px;
`;

const inviteFormMaxWidth = 400;

const Heading = styled.h2`
  max-width: 512px;
  margin: 64px auto;
  line-height: 1;
  text-align: center;
  color: ${lineDarkerColor};
  font-size: 64px;

  @media (max-width: ${inviteFormMaxWidth + containerPadding * 2 - 1}px) {
    font-size: 48px;
  }
`;

const inviteFormHeight = 64;
const inviteFormBorderWidth = 2;
const inviteFormPaddingWidth = 8;
const inviteFormInnerHeight =
  inviteFormHeight - inviteFormBorderWidth * 2 - inviteFormPaddingWidth * 2;

const inviteFormLayout = css`
  max-width: ${inviteFormMaxWidth}px;
  height: ${inviteFormHeight}px;
  margin: 0 auto;
  border-radius: ${inviteFormHeight / 2}px;
  overflow: hidden;
`;

const InviteForm = styled.form`
  display: flex;
  ${inviteFormLayout}
  padding: ${inviteFormPaddingWidth}px;
  border: ${inviteFormBorderWidth}px solid ${lineLighterColor};
  cursor: text;

  &:focus-within {
    border: ${inviteFormBorderWidth}px solid ${lineFocusColor};
  }
`;

const Email = styled.label`
  flex-grow: 100;
`;

const emailInputHeight = inviteFormInnerHeight / 2;
const inviteFormLeftPadding = inviteFormInnerHeight / 2;

const emailSectionLayout = css`
  display: block;
  width: 100%;
  height: ${emailInputHeight}px;
  line-height: ${emailInputHeight}px;
  padding: 0 0 0 ${inviteFormLeftPadding}px;
`;

const EmailLabel = styled.div`
  ${emailSectionLayout}
  font-size: 13px;
  font-weight: bold;
  color: ${lineDarkColor};
  cursor: text;
`;

const halfEmailInputHeight = Math.ceil(emailInputHeight / 2);

const EmailInput = styled.input`
  ${emailSectionLayout}
  border: 0;
  outline: 0;
  color: ${lineDarkColor};

  &:focus {
    outline: 0;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    box-shadow: inset 0 0 0 ${halfEmailInputHeight}px #ffffff;
  }

  &::placeholder {
    color: ${lineLightColor};
    opacity: 1;
  }
`;

const InviteSubmit = styled.button`
  display: block;
  width: ${inviteFormInnerHeight}px;
  height: ${inviteFormInnerHeight}px;
  padding: 0;
  border: 0;
  border-radius: ${inviteFormInnerHeight / 2}px;
  outline: 0;
  cursor: pointer;
  background-color: ${buttonDefaultColor};

  &:focus,
  &:hover {
    background-color: ${buttonHoverColor};
  }

  &:active {
    background-color: ${buttonActiveColor};
  }
`;

const InviteSubmitIcon = styled.img`
  display: block;
`;

const InviteFormSubmitting = styled.div`
  ${inviteFormLayout}
  line-height: ${inviteFormHeight}px;
  border: ${inviteFormBorderWidth}px solid ${lineFocusColor};
  background: linear-gradient(
    270deg,
    #ffffff,
    ${lineFocusColor},
    #ffffff,
    ${lineFocusColor}
  );
  background-size: 300% 100%;
  animation: ${wobble} 1.5s ease infinite;
`;

const inputFormCompletedLineHeight =
  inviteFormHeight - inviteFormBorderWidth * 2;

const InviteFormCompleted = styled.div`
  ${inviteFormLayout}
  line-height: ${inputFormCompletedLineHeight}px;
  border: ${inviteFormBorderWidth}px solid ${lineLighterColor};
  text-align: center;
  color: ${lineLightColor};
`;

const LandingPage: FunctionComponent<{}> = () => {
  const cancelToken = useCancel();
  const [state, setState] = useState<State>({ type: 'NotSent', email: '' });
  const inputRef = useRef<HTMLInputElement | null>(null);

  (isBrowser ? useLayoutEffect : useEffect)(() => {
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
  if (state.type === 'NotSent') {
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
  } else if (state.type === 'Sending') {
    inviteForm = <InviteFormSubmitting />;
  } else {
    inviteForm = <InviteFormCompleted>Check your email!</InviteFormCompleted>;
  }

  return (
    <Container>
      <Heading>A home for all your notes.</Heading>
      {inviteForm}
    </Container>
  );
};

export default LandingPage;
