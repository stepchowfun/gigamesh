// eslint-disable-next-line no-unused-vars
import React from "react";

import ReactDOM from "react-dom";
import attachFastClick from "fastclick";
import { helloWorld } from "./endpoints";

// @ts-ignore
import logoPath from "../images/logo.svg";

// eslint-disable-next-line no-unused-vars
class Main extends React.Component<{}, { name: string }> {
  constructor(props: {}) {
    super(props);
    this.state = { name: "Visitor" };
  }

  static getStarted(e: React.MouseEvent) {
    e.preventDefault();
  }

  static logIn(e: React.MouseEvent) {
    e.preventDefault();
  }

  static handleClick(e: React.MouseEvent) {
    e.preventDefault();
    helloWorld("You clicked the link!").then((response) => {
      // eslint-disable-next-line no-alert
      alert(response.data);
    });
  }

  render() {
    return (
      <div className="main">
        <div className="header">
          <div className="title">
            <img className="logo" src={logoPath} alt="Gigamesh" />
          </div>
          <div className="authentication">
            <a href="#" onClick={Main.getStarted}>
              Let’s go ›
            </a>
          </div>
        </div>
        <div className="editor">
          <p>
            Hello, {this.state.name}!{" "}
            <a href="#" onClick={Main.handleClick}>
              Click here!
            </a>
          </p>
        </div>
      </div>
    );
  }
}

// Render the main component.
ReactDOM.render(<Main />, document.getElementById("main"));

// FastClick eliminates the 300ms delay between a physical tap and the firing of a click event on
// mobile browsers.
attachFastClick(document.body);
