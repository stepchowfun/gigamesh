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

const SmileyContainer = styled.img`
  cursor: pointer;
`;

class App extends React.Component {
  static handleClick1(e: React.MouseEvent): void {
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

  static handleClick2(e: React.MouseEvent): void {
    e.preventDefault();

    storageDemo({})
      .then((response) => {
        // eslint-disable-next-line no-alert
        alert(response.now);
      })
      .catch((reason) => {
        // eslint-disable-next-line no-alert
        alert(reason);
      });
  }

  render(): React.ReactNode {
    return (
      <AppContainer>
        <p>
          <SmileyContainer
            src={smiley}
            alt="Smiley face"
            // eslint-disable-next-line @typescript-eslint/unbound-method
            onClick={App.handleClick1}
          />{' '}
          <SmileyContainer
            src={smiley}
            alt="Smiley face"
            // eslint-disable-next-line @typescript-eslint/unbound-method
            onClick={App.handleClick2}
          />
        </p>
        <p>1 + 2 = {sum(1, 2)}</p>
      </AppContainer>
    );
  }
}

export default App;
