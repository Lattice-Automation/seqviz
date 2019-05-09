import * as React from "react";
import SeqViewer from "./SeqViewer/SeqViewer";
import "./PartExplorer.scss";
import BlankPage from "../BlankPage/BlankPage";
import request from "request";
import shortid from "shortid";
import { annotationFactory } from "../Utils/sequence";

/**
 * a container for investigating the meta and sequence information of a part
 */
class PartExplorer extends React.PureComponent {
  state = {
    showSearch: false,
    seqSelection: { type: "", ref: null, start: 0, end: 0, clockwise: true },
    findState: {
      searchResults: [],
      searchIndex: 0
    },
    circularCentralIndex: 0,
    linearCentralIndex: 0
  };

  setPartState = state => {
    let newState = Object.keys(state).reduce((newState, key) => {
      if (typeof state[key] === "object") {
        newState[key] = { ...this.state[key], ...state[key] };
      } else {
        newState[key] = state[key];
      }
      return newState;
    }, {});
    const { ...rest } = this.state;
    this.setState({ ...rest, ...newState });
  };

  lambdaAnnotate = async part => {
    const result = await new Promise((resolve, reject) => {
      request.post(
        {
          uri: `${String(process.env.REACT_APP_LAMBDA_URL)}/annotate`,
          method: "POST",
          json: JSON.stringify({
            part: { id: shortid.generate(), seq: part.seq }
          }),
          headers: {
            "Content-Type": "application/json"
          }
        },
        (err, resp) => {
          if (err) {
            console.log("Error with automatic annotation: ", err);
            return reject(err);
          }
          return resolve(resp.toJSON());
        }
      );
    });

    if (result.statusCode !== 200) {
      const err = JSON.stringify(result.body);
      throw new Error(`Lambda annotations failed. Server response: ${err}`);
    }

    return result;
  };

  autoAnnotate = async part => {
    const result = await this.lambdaAnnotate(part);
    let annotations = result.body.map(a => ({ ...annotationFactory(), ...a }));
    // add in the annotations already on the part
    annotations = part.annotations.concat(annotations);
    // filter out duplicates
    annotations = annotations.reduce((acc, a) => {
      if (
        !acc.find(
          ann =>
            ann.name === a.name && ann.start === a.start && ann.end === a.end
        )
      ) {
        return acc.concat(a);
      }
      return acc;
    }, []);
    return { ...part, annotations };
  };

  render() {
    const { circular, annotate } = this.props;
    let { part, onSelection, size } = this.props;
    const partState = this.state;
    part = annotate ? this.autoAnnotate(part) : part;
    return (
      <div className="part-explorer-container" id="part-explorer">
        <div className="seq-viewers-container">
          {circular
            ? part.seq.length > 0 && (
                <SeqViewer
                  part={part}
                  {...partState}
                  setPartState={this.setPartState}
                  onSelection={onSelection}
                  size={size}
                  Circular
                />
              )
            : part.seq.length > 0 && (
                <SeqViewer
                  part={part}
                  {...partState}
                  setPartState={this.setPartState}
                  onSelection={onSelection}
                  size={size}
                  Circular={false}
                />
              )}
          {part.seq.length < 1 && <BlankPage />}
        </div>
      </div>
    );
  }
}

export default PartExplorer;
