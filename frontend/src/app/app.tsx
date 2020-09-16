import React from 'react';
import styled from 'styled-components';
import smiley from './smiley.svg';
import sum from '../sum/sum';
import { helloWorld } from '../api';

const AppContainer = styled.div`
  color: #333333;
  text-align: center;
`;

const SmileyContainer = styled.img`
  cursor: pointer;
`;

class App extends React.Component {
  static handleClick(e: React.MouseEvent) {
    e.preventDefault();
    helloWorld('You clicked the link!').then((response) => {
      // eslint-disable-next-line no-alert
      alert(response.data);
    });
  }

  render() {
    return (
      <AppContainer>
        <p>
          <SmileyContainer
            src={smiley}
            alt="Smiley face"
            onClick={App.handleClick}
          />
        </p>
        <p>1 + 2 = {sum(1, 2)}</p>
      </AppContainer>
    );
  }
}

export default App;
