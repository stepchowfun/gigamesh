// eslint-disable-next-line no-unused-vars
import * as React from "react";

import * as ReactDOM from "react-dom";

interface HelloProps {
  name: string;
}

// eslint-disable-next-line no-unused-vars
const Hello = (props: HelloProps) => <h1>Hello, {props.name}!</h1>;

ReactDOM.render(<Hello name="Gigamesh" />, document.getElementById("main"));
