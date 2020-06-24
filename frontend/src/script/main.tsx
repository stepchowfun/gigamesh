// eslint-disable-next-line no-unused-vars
import React from "react";

import ReactDOM from "react-dom";
import attachFastClick from "fastclick";
import { fromByteArray } from "base64-js";
import { helloWorld } from "./endpoints";

// eslint-disable-next-line no-unused-vars
import Modal from "./modal";

// eslint-disable-next-line no-unused-vars
class Main extends React.Component<
  {},
  { sessionId: string; authenticationFormVisible: boolean }
> {
  constructor(props: {}) {
    super(props);
    this.state = {
      sessionId: Main.generateSessionId(),
      authenticationFormVisible: false,
    };

    // The traditional React component method binding ceremony.
    this.openAuthenticationModal = this.openAuthenticationModal.bind(this);
    this.closeAuthenticationModal = this.closeAuthenticationModal.bind(this);
  }

  static generateSessionId(): string {
    const randomData = new Uint8Array(32);
    window.crypto.getRandomValues(randomData);
    return fromByteArray(randomData);
  }

  static home() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  openAuthenticationModal() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.setState({ authenticationFormVisible: true });
  }

  closeAuthenticationModal() {
    this.setState({ authenticationFormVisible: false });
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
          <div className="max-width">
            <button className="home-button" onClick={Main.home}>
              <span className="button-alt-text">Home</span>
            </button>
            <button
              className="log-in-button"
              onClick={this.openAuthenticationModal}
            >
              <span className="button-alt-text">Log in</span>
            </button>
          </div>
        </div>
        <div className="max-width">
          <div className="editor">
            <p>
              Your session ID is {this.state.sessionId}.{" "}
              <a href="#" onClick={Main.handleClick}>
                Click here!
              </a>
            </p>

            <p>
              Lorem ipsum dolor sit amet, no consul legere iracundia nec, eum id
              homero aeterno percipitur. Mel vulputate inciderint in. Novum
              graeco ne pri. Clita consul persequeris at vix, iudico vidisse
              suavitate vix ex, ei mea dicit ceteros vivendo.
            </p>

            <p>
              Ut pro corpora evertitur contentiones, alia duis eos no, omnis
              summo usu ne. Cum unum dicta reprehendunt eu. Ius unum omnis
              aperiam ut, mei et quodsi melius, sea constituto dissentiunt ex.
              Ius dicit dissentiunt accommodare an, in eos nostrum epicurei. Qui
              justo omittam an, an omittam deseruisse scripserit pro. Cu eos
              justo interesset conclusionemque, alterum deterruisset id pri, in
              minim malorum inermis vim.
            </p>

            <p>
              Quidam causae sensibus te vim, mei te consequat constituto
              sententiae. At vidit viris ornatus sed, tota viris posidonium ex
              duo, liber diceret fastidii mel at. Simul vitae perfecto ad eam,
              ex mei impedit nostrum definitiones. At has summo contentiones, et
              sint assum qui. Ei nec appareat deseruisse cotidieque, eu mel sumo
              tantas, partem aperiam molestiae eu est. Consul commodo scripserit
              ut pro, viderer habemus scribentur has an, enim atqui praesent id
              qui.
            </p>

            <p>
              Omnes legere voluptatum id qui, vim delicata petentium urbanitas
              an. Audiam repudiare ex vim, his persius volumus interesset te,
              mea veniam delectus cu. Sit an vide evertitur consectetuer. Ne mel
              graecis periculis, mei exerci expetendis ei. In duo utinam ceteros
              omittantur, timeam iuvaret eum ad.
            </p>

            <p>
              Natum probo disputando usu cu. Ferri errem pri an, melius perfecto
              an mea, ex usu animal adipisci liberavisse. Consul option minimum
              nec in. Nec sanctus insolens euripidis ut. Ad case habeo libris
              usu.
            </p>

            <p>
              Lorem ipsum dolor sit amet, no consul legere iracundia nec, eum id
              homero aeterno percipitur. Mel vulputate inciderint in. Novum
              graeco ne pri. Clita consul persequeris at vix, iudico vidisse
              suavitate vix ex, ei mea dicit ceteros vivendo.
            </p>

            <p>
              Ut pro corpora evertitur contentiones, alia duis eos no, omnis
              summo usu ne. Cum unum dicta reprehendunt eu. Ius unum omnis
              aperiam ut, mei et quodsi melius, sea constituto dissentiunt ex.
              Ius dicit dissentiunt accommodare an, in eos nostrum epicurei. Qui
              justo omittam an, an omittam deseruisse scripserit pro. Cu eos
              justo interesset conclusionemque, alterum deterruisset id pri, in
              minim malorum inermis vim.
            </p>

            <p>
              Quidam causae sensibus te vim, mei te consequat constituto
              sententiae. At vidit viris ornatus sed, tota viris posidonium ex
              duo, liber diceret fastidii mel at. Simul vitae perfecto ad eam,
              ex mei impedit nostrum definitiones. At has summo contentiones, et
              sint assum qui. Ei nec appareat deseruisse cotidieque, eu mel sumo
              tantas, partem aperiam molestiae eu est. Consul commodo scripserit
              ut pro, viderer habemus scribentur has an, enim atqui praesent id
              qui.
            </p>

            <p>
              Omnes legere voluptatum id qui, vim delicata petentium urbanitas
              an. Audiam repudiare ex vim, his persius volumus interesset te,
              mea veniam delectus cu. Sit an vide evertitur consectetuer. Ne mel
              graecis periculis, mei exerci expetendis ei. In duo utinam ceteros
              omittantur, timeam iuvaret eum ad.
            </p>

            <p>
              Natum probo disputando usu cu. Ferri errem pri an, melius perfecto
              an mea, ex usu animal adipisci liberavisse. Consul option minimum
              nec in. Nec sanctus insolens euripidis ut. Ad case habeo libris
              usu.
            </p>
          </div>
        </div>
        <Modal
          visible={this.state.authenticationFormVisible}
          onClose={this.closeAuthenticationModal}
        >
          <div className="padding">Hello!</div>
        </Modal>
      </div>
    );
  }
}

// Render the main component.
ReactDOM.render(<Main />, document.getElementById("main"));

// FastClick eliminates the 300ms delay between a physical tap and the firing of a click event on
// mobile browsers.
attachFastClick(document.body);
