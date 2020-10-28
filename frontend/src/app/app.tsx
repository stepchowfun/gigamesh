import React from 'react';
import styled from 'styled-components';
import smiley from './smiley.svg';
import sum from '../sum/sum';
import emailDemo from '../api/emailDemo';
import storageDemo from '../api/storageDemo';

const AppContainer = styled.div`
  color: #333333;
  text-align: center;
`;

interface SmileyProps {
  readonly loaded: boolean;
}

const SmileyContainer = styled.img<SmileyProps>`
  cursor: pointer;
  opacity: ${(props) => (props.loaded ? 1 : 0.1)};
`;

class App extends React.Component<
  Record<string, unknown>,
  { loaded: boolean }
> {
  static handleClick(e: React.MouseEvent): void {
    e.preventDefault();

    emailDemo({ age: 42 })
      .then((response) => {
        // eslint-disable-next-line no-alert
        alert(response.newAge);
      })
      .catch((reason) => {
        // eslint-disable-next-line no-alert
        alert(reason);
      });
  }

  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = { loaded: false };
  }

  componentDidMount(): void {
    storageDemo({})
      .then(() => {
        this.setState({ loaded: true });
      })
      .catch((reason) => {
        // eslint-disable-next-line no-alert
        alert(reason);
      });
  }

  render(): React.ReactNode {
    const { loaded } = this.state;

    return (
      <AppContainer>
        <p>
          <SmileyContainer
            src={smiley}
            alt="Smiley face"
            // eslint-disable-next-line @typescript-eslint/unbound-method
            onClick={App.handleClick}
            loaded={loaded}
          />
        </p>
        <p>1 + 2 = {sum(1, 2)}</p>
      </AppContainer>
    );
  }
}

export default App;
