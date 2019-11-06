import { isEqual } from "lodash";
import * as React from "react";
import sizeMe, { SizeMe } from "react-sizeme";
import request from "request";
import shortid from "shortid";

import SeqViewer from "./SeqViewer/SeqViewer";
import "./PartExplorer.scss";
import { annotationFactory, defaultSelection } from "../Utils/sequence";
import { directionality } from "../Utils/parser";
import processPartInput from "../io/processPartInput";

sizeMe.noPlaceholders = true;

/**
 * a container for investigating the meta and sequence information of a part
 */
class PartExplorer extends React.Component {
  state = {
    seqSelection: defaultSelection,
    findState: {
      searchResults: [],
      searchIndex: 0
    },
    circularCentralIndex: 0,
    linearCentralIndex: 0,
    part: {}
  };

  createPart = async (newPart = false) => {
    const { part: partInput, annotate, colors, backbone } = this.props;
    let part = await processPartInput(newPart, partInput, { colors, backbone });
    part = annotate ? await this.autoAnnotate(part, colors) : part;
    this.setState({ part: part });
  };

  addKeyBindings = () => {
    const { searchNext, copySeq } = this.props;

    /**
     * copy the given range of the linearSequence to the users clipboard
     * more info @ https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
     */
    const clipboardCopy = () => {
      const {
        part: { seq },
        seqSelection: {
          selectionMeta: { start, end },
          ref
        }
      } = this.state;
      const formerFocus = document.activeElement;
      const tempNode = document.createElement("textarea");
      if (ref === "ALL") {
        tempNode.innerText = seq;
      } else {
        tempNode.innerText = seq.substring(start, end);
      }
      if (document.body) {
        document.body.appendChild(tempNode);
      }
      tempNode.select();
      document.execCommand("copy");
      tempNode.remove();
      if (formerFocus) {
        formerFocus.focus();
      }
    };

    const handleKeyPress = e => {
      const input = (({ metaKey, altKey, ctrlKey, shiftKey, key }) => ({
        metaKey,
        altKey,
        ctrlKey,
        shiftKey,
        key
      }))(e);
      const next = (({ meta, alt, ctrl, shift, key }) => ({
        metaKey: meta,
        altKey: alt,
        ctrlKey: ctrl,
        shiftKey: shift,
        key
      }))(searchNext);
      if (isEqual(input, next)) {
        this.incrementSearch();
      }
      const copy = (({ meta, alt, ctrl, shift, key }) => ({
        metaKey: meta,
        altKey: alt,
        ctrlKey: ctrl,
        shiftKey: shift,
        key
      }))(copySeq);
      if (isEqual(input, copy)) {
        clipboardCopy();
      }
    };

    const takenBindings = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

    const newBindingsMap = { searchNext: searchNext, copySeq: copySeq };

    let uniqueNewBindings = {};
    for (const binding in newBindingsMap) {
      const currKey = newBindingsMap[binding].key;
      if (currKey && takenBindings.includes(currKey)) {
        console.error(
          `Up, Down, Left, and Right Arrow keys are already bound, please chose another key binding for ${binding}.`
        );
      } else if (Object.keys(uniqueNewBindings).includes(currKey)) {
        for (const ubinding of uniqueNewBindings[currKey]) {
          if (isEqual(newBindingsMap[binding], newBindingsMap[ubinding])) {
            console.error(
              `Custom key bindings must be unique. ${binding} and ${ubinding} cannot share the same key bindings.`
            );
          } else {
            uniqueNewBindings = {
              ...uniqueNewBindings,
              ...{
                [currKey]: uniqueNewBindings[currKey].concat([binding])
              }
            };
          }
        }
      } else {
        window.addEventListener("keydown", e => handleKeyPress(e));
        uniqueNewBindings = {
          ...uniqueNewBindings,
          ...{ [currKey]: [binding] }
        };
      }
    }
  };

  componentDidMount = async () => {
    this.createPart(true);
    this.addKeyBindings();
  };

  shouldComponentUpdate = (nextProps, nextState) =>
    !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);

  componentDidUpdate = async prevProps => {
    const {
      part: partInput,
      annotate,
      colors,
      backbone,
      zoom: { circular: czoom, linear: lzoom },
      enzymes
    } = this.props;

    const {
      part: prevPart,
      annotate: prevAnnotate,
      colors: prevColors,
      backbone: prevBackbone,
      zoom: { circular: prevCzoom, linear: prevLzoom },
      enzymes: prevEnzymes
    } = prevProps;

    if (
      partInput !== prevPart ||
      annotate !== prevAnnotate ||
      backbone !== prevBackbone ||
      colors !== prevColors ||
      czoom !== prevCzoom ||
      lzoom !== prevLzoom ||
      enzymes !== prevEnzymes
    ) {
      this.createPart(partInput !== prevPart);
      this.addKeyBindings();
    }
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

  /**
   * Traverse the search results array and return a search index via a prop callback to
   * tell the viewer what to highlight
   */
  incrementSearch = () => {
    const {
      findState: { searchResults, searchIndex }
    } = this.state;
    let newSearchIndex = searchIndex;
    if (searchResults.length) {
      const lastIndex = searchResults.length - 1;
      newSearchIndex += 1;
      if (newSearchIndex > lastIndex) newSearchIndex = 0;
      this.setState({
        findState: {
          searchResults: searchResults,
          searchIndex: newSearchIndex
        },
        circularCentralIndex: searchResults[searchIndex].start,
        linearCentralIndex: searchResults[searchIndex].start
      });
    }
  };

  /**
   * Send a POST to lattice's AWS Lambda auto-annotate endpoint
   */
  lambdaAnnotate = async part => {
    const result = await new Promise((resolve, reject) => {
      request.post(
        {
          uri: "https://microservices.latticeautomation.com/annotate",
          method: "POST",
          json: JSON.stringify({
            id: shortid.generate(),
            seq: part.seq.toLowerCase()
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

  /**
   * A function for adding annotations automatically given a part's sequence alone.
   * Calls a remote lambda service which uses BLAST and a pre-populated feature database
   */
  autoAnnotate = async (part, colors = []) => {
    let result;
    try {
      if (navigator.onLine) {
        // make the call
        result = await this.lambdaAnnotate(part);
      } else {
        throw new Error(
          `It looks like you wanted to annotate your part, but could not connect to our BLAST endpoint. Please check that you have a stable network connection.`
        );
      }
    } catch (error) {
      console.error(error.message);
      return error;
    }
    let annotations = result.body.annotations.map(a => ({
      ...annotationFactory(part.name, a.name || a.start, colors),
      ...a,
      ...{ direction: directionality(a.direction) }
    }));

    // add only annotations that don't already exist on the part with the same name and start/end
    // do not concat and globally cull duplicates, we want to deduplicate features
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
    }, part.annotations);
    return { ...part, annotations };
  };

  render() {
    const { viewer } = this.props;
    const { part } = this.state;

    const partAvailable = part.seq || part.seq === "" || false;
    const linear = viewer === "linear" || viewer === "both";
    const circular = viewer === "circular" || viewer === "both";

    if (!partAvailable || !part.seq.length) {
      return (
        <div
          className="la-vz-part-explorer-container"
          id="la-vz-part-explorer"
        />
      );
    }

    return (
      <div className="la-vz-part-explorer-container" id="la-vz-part-explorer">
        <div className="la-vz-seq-viewers-container">
          {circular && (
            <SizeMe
              monitorHeight
              render={({ size }) => {
                return (
                  <SeqViewer
                    {...this.props}
                    {...this.state}
                    {...part}
                    setPartState={this.setPartState}
                    incrementSearch={this.incrementSearch}
                    size={size}
                    Circular
                  />
                );
              }}
            />
          )}

          {linear && (
            <SizeMe
              monitorHeight
              render={({ size }) => {
                return (
                  <SeqViewer
                    {...this.props}
                    {...this.state}
                    {...part}
                    setPartState={this.setPartState}
                    incrementSearch={this.incrementSearch}
                    size={size}
                    Circular={false}
                  />
                );
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default PartExplorer;
