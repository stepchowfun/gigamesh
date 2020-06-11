// eslint-disable-next-line no-unused-vars
import * as React from "react";

import * as ReactDOM from "react-dom";

// eslint-disable-next-line no-unused-vars
import axios, { AxiosInstance, AxiosResponse } from "axios";

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

    // Why is this cast necessary?
    (axios as AxiosInstance)
      .get("https://us-east1-gigamesh-279607.cloudfunctions.net/helloWorld", {
        params: {
          message: "Gigamesh!",
        },
      })
      .then((response: AxiosResponse) => {
        // eslint-disable-next-line no-alert
        alert(response.data);
      });
  }

  render() {
    return (
      <div className="main">
        <div className="header">
          <div className="title">Gigamesh</div>
          <div className="authentication">
            <a href="#" onClick={Main.getStarted}>
              Get started
            </a>
            <a href="#" onClick={Main.logIn}>
              Log in
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

ReactDOM.render(<Main />, document.getElementById("main"));
