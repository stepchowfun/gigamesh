// eslint-disable-next-line no-unused-vars
import React from "react";

const Modal: React.SFC<{ visible: boolean; onClose: () => void }> = (props) => {
  return (
    <div
      className={`modal-background ${props.visible ? "" : "hidden"}`}
      onClick={props.onClose}
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">{props.children}</div>
      </div>
    </div>
  );
};

export default Modal;
