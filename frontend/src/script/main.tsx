// eslint-disable-next-line no-unused-vars
import * as React from "react";

import * as ReactDOM from "react-dom";

interface HelloProps {
  name: string;
}

// eslint-disable-next-line no-unused-vars
function Hello(props: HelloProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();

    // eslint-disable-next-line no-alert
    alert("You clicked the link!");
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
