// eslint-disable-next-line no-unused-vars
import React from "react";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

// eslint-disable-next-line no-unused-vars
class Modal extends React.Component<ModalProps, {}> {
  constructor(props: ModalProps) {
    super(props);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  onKeyPress(event: KeyboardEvent) {
    // Check for the ESC key.
    if (event.keyCode === 27) {
      this.props.onClose();
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyPress, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPress, false);
  }

  render() {
    return (
      <div
        className={`modal-background ${this.props.visible ? "" : "hidden"}`}
        onClick={this.props.onClose}
      >
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default Modal;
