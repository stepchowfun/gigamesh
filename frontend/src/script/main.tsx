// eslint-disable-next-line no-unused-vars
import * as React from "react";

import * as ReactDOM from "react-dom";

// eslint-disable-next-line no-unused-vars
import axios, { AxiosInstance, AxiosResponse } from "axios";

interface HelloProps {
  name: string;
}

// eslint-disable-next-line no-unused-vars
function Hello(props: HelloProps) {
  function handleClick(e: React.MouseEvent) {
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

  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>
        <a href="#" onClick={handleClick}>
          Click here!
        </a>
      </p>
    </div>
  );
}

ReactDOM.render(<Hello name="Gigamesh" />, document.getElementById("main"));
