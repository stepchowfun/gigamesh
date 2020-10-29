import React from 'react';
import styled from 'styled-components';
import invite from '../api/invite';

const AppContainer = styled.div`
  width: 320px;
  margin: 64px auto;
  color: #333333;
`;

class App extends React.Component<
  Record<string, unknown>,
  { email: string; submittingInvite: boolean }
> {
  private handleEmailChangeBound: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;

  private handleInviteSubmitBound: (
    event: React.FormEvent<HTMLFormElement>,
  ) => void;

  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = { email: '', submittingInvite: false };

    this.handleEmailChangeBound = this.handleEmailChange.bind(this);
    this.handleInviteSubmitBound = this.handleInviteSubmit.bind(this);
  }

  handleEmailChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();

    this.setState({ email: event.target.value });
  }

  handleInviteSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const { email } = this.state;

    this.setState({ submittingInvite: true });

    invite({ email })
      .then(() => {
        this.setState({ email: '', submittingInvite: false });
      })
      .catch((reason) => {
        // eslint-disable-next-line no-alert
        alert(reason);
      });
  }

  render(): React.ReactNode {
    const { email, submittingInvite } = this.state;

    return (
      <AppContainer>
        <form onSubmit={this.handleInviteSubmitBound}>
          <h2>Get started</h2>
          <label>
            Email:{' '}
            <input
              type="email"
              placeholder="sophie@example.com"
              value={email}
              onChange={this.handleEmailChangeBound}
              disabled={submittingInvite}
              required
            />
          </label>
        </form>
      </AppContainer>
    );
  }
}

export default App;
