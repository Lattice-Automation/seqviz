import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Badge } from "react-bootstrap";
import Dropdown from "../../../Dropdown/Dropdown";
import "./OptionsDropdown.scss";

/**
 * map the names of the variables in SeqViewer state to names that
 * will make more sense to a user
 */
const optionsNameMap = {
  CutSites: "Cut Sites",
  ORF: "ORFs" // would spell it out but it doesn't fit
};

/**
 * countable items include annotations and translations
 * key is the name of the boolean in SeqViewer state,
 * value is the name of the countable array in SeqViewer props
 */
const countable = {
  Annotations: "annotations"
};

/**
 * show all options here for the dropdown
 */
export default class OptionsDropdown extends React.PureComponent {
  render() {
    const { checkBoxes, seqStateChange, ...rest } = this.props;

    return (
      <Dropdown
        title={
          <div className="options-container">
            <FontAwesomeIcon
              titleclass="options-icon"
              role="button"
              icon={faCog}
            />
          </div>
        }
        id="viewer-options"
      >
        {checkBoxes.map(b => (
          <label htmlFor={b} key={b} className="options-dropdown">
            <input
              id={b}
              type="checkbox"
              name={b}
              checked={rest[b]}
              onChange={seqStateChange}
            />
            {optionsNameMap[b] || b}
            {countable[b] ? <Badge>{rest[countable[b]].length}</Badge> : null}
          </label>
        ))}
      </Dropdown>
    );
  }
}
