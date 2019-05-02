// @flow

import * as React from "react";
import ReactDOM from "react-dom";
import "./Dropdown.scss";

const DISPLAY_NAME = "DROPDOWN";

const modalRoot = window.document.getElementById("modal-root");

/**
 * A dropdown for the App header
 *
 * This dropdown supports nested menu options. It takes an array of
 * node elements. These elements are either 1) a react elements or 2)
 * other dropdowns (for nested dropdowns).
 *
 * When rendering this dropdown, if an entry is an element, it will simply
 * be rendered as an entry and any callbacks should be dealt with before
 * passing it to this dropdown (eg: a callback for updating parent state in an
 * input box)
 *
 * If, on the otherhand, the entry is another dropdown, that dropdown
 * will be rendered to the right of the current one (nested) if it's selected
 *
 * Unless the rendered dropdown is nested, the y position will always be the same (just a bit
 * more than the height of the App header), but the event that triggered this
 * dropdown needs to be passed so this component can find the bounding box of the
 * click's target (and position itself beneath that component)
 */
class SubDropdown extends React.PureComponent {
  static defaultProps = {
    title: ""
  };

  constructor(props) {
    super(props);
    this.state = { activeNestedDropdownIndex: -1 };
    this.dropdown = document.createElement("div");
  }

  componentDidMount = () => {
    if (modalRoot && this.dropdown) {
      modalRoot.appendChild(this.dropdown);
    }
  };

  componentWillUnmount = () => {
    if (modalRoot && this.dropdown && modalRoot.contains(this.dropdown))
      modalRoot.removeChild(this.dropdown);
  };

  handleMouseOverParent = index => {
    this.setState({
      activeNestedDropdownIndex: index
    });
  };

  handleMouseOverButton = () => {
    this.setState({
      activeNestedDropdownIndex: -1
    });
  };

  leftDropDown = () => {
    this.setState({
      activeNestedDropdownIndex: -1
    });
  };

  dropdown;

  /**
   * return a nested dropdown button. this is the dropdown item as it appears in
   * the dropdown (where the instance's prop name is what's shown in the dropdown)
   * and an arrow is added on whichever side the dropdown is going to open towards
   *
   * this also holds the callback that activates this sub entry (showing its submenu)
   */
  renderNestedDropdown = (index, direction, c) => (
    <button
      type="button"
      className="dropdown-item nested-button"
      key={`${index}_${c.key}`}
      onMouseOver={() => this.handleMouseOverParent(index)}
    >
      {direction === "LEFT" && <div className="nested-arrow-left" />}
      {c.props.title}
      {direction === "RIGHT" && <div className="nested-arrow-right" />}
    </button>
  );

  render() {
    if (!this.dropdown) return null;

    const { children, width, position, modalStyle } = this.props;
    const { activeNestedDropdownIndex } = this.state;
    let { direction } = this.props;

    // calculate how far left or right the next dropdown should go
    let left = position.left + width;
    if (left + width > window.screen.width || direction === "LEFT") {
      left -= 2 * width;
      direction = "LEFT";
    }

    // update the top point, given 36px per row
    // this needs to updated when css of .dropdown changes
    let top = position.top - 34; // accounting for first add

    return ReactDOM.createPortal(
      <div
        className="dropdown modal"
        onMouseLeave={() => this.leftDropDown()}
        style={{ ...position, ...modalStyle }}
      >
        {React.Children.toArray(children).map((c, i) => {
          top += 36;
          // check whether this child is a Dropdown (nested dropdown)
          // or some other element
          if (c.type.displayName !== DISPLAY_NAME) {
            // adding dropdown-item class name which gives the element its padding
            return React.cloneElement(c, {
              className: `dropdown-item ${c.props.className || ""}`,
              onMouseOver: () => this.handleMouseOverButton()
            });
          }
          if (i === activeNestedDropdownIndex) {
            // this is a currently opened sub dropdown
            return (
              <React.Fragment key={c.key}>
                {this.renderNestedDropdown(i, direction, c)}
                <SubDropdown
                  width={width}
                  position={{ ...position, left, top }}
                  direction={direction}
                >
                  {c.props.children}
                </SubDropdown>
              </React.Fragment>
            );
          }
          // this is just a trigger for a dropdown, not open
          return this.renderNestedDropdown(i, direction, c);
        })}
      </div>,
      this.dropdown
    );
  }
}

export default class Dropdown extends React.PureComponent {
  static defaultProps = {
    width: 205,
    style: {},
    modalStyle: {}
  };

  static displayName = DISPLAY_NAME;

  static getDerivedStateFromProps = nextProps => {
    if (typeof nextProps.open !== "undefined") {
      return {
        clicked: nextProps.open
      };
    }
    return null;
  };

  state = {
    clicked: false
  };

  componentDidMount = () => {
    window.addEventListener("mousedown", this.toggleDropdown);
  };

  componentWillUnmount = () => {
    window.removeEventListener("mousedown", this.toggleDropdown);
  };

  /**
   * something other than "this" has been clicked (this is the trigger, a cog like buttonRef
   * or something similar)
   *
   * it might be something outside the dropdown entirely. if so, while thing should close
   *
   * it might be something nested deep inside this dropdown, in which case this should still
   * close because that nested selection doesn't matter
   */
  toggleDropdown = e => {
    if (!this.buttonRef) return; // should never happen

    const togglePressed =
      e.target === this.buttonRef || this.buttonRef.contains(e.target);

    // first, check if the click is totally outside this dropdown
    if (!togglePressed && !modalRoot.contains(e.target)) {
      this.setState({ clicked: false });
    } else if (togglePressed) {
      // the toggle button for the dropdown was clicked, toggle the dropdown
      // to the opposite of whatever it is right now
      this.setState({ clicked: !this.state.clicked });

      // also want to be notified about every toggle
    } else if (modalRoot.contains(e.target)) {
      const { className, tagName } = e.target;

      // dont' close on a nested button, might just be the opening of a nested window
      if (
        !className.includes("nested-button") &&
        tagName !== "INPUT" &&
        tagName !== "LABEL" &&
        tagName !== "SPAN"
      ) {
        // some terminal menu option was clicked. wait for it to take effect and then
        // HACK
        setTimeout(() => {
          // check to make sure everything hasn't been removed from DOM (happens on logout with userprofile)
          if (modalRoot.hasChildNodes()) {
            this.setState({ clicked: false });
          }
        }, 200);
      }
    }
  };

  buttonRef;

  render() {
    const {
      title,
      width: dropdownWidth,
      style,
      modalStyle,
      id,
      titleClass,
      children
    } = this.props;
    const { clicked } = this.state;

    let dropdownPosition = null;
    let direction = "RIGHT";
    let buttonLeft = 0;
    let buttonBottom = 0;
    let width = 0;

    if (this.buttonRef) {
      ({
        left: buttonLeft,
        bottom: buttonBottom,
        width
      } = this.buttonRef.getBoundingClientRect());
      let left = buttonLeft;
      if (buttonLeft + dropdownWidth > document.documentElement.clientWidth) {
        left = buttonLeft - dropdownWidth + width;
        direction = "LEFT";
      }

      dropdownPosition = {
        top: buttonBottom,
        left: left,
        width: dropdownWidth
      };
    }

    const className = ["dropdown-button-container", titleClass].join(" ");

    return (
      <button
        type="button"
        className={className}
        id={id}
        ref={button => {
          this.buttonRef = button;
        }}
        style={style}
      >
        {title}
        {clicked && dropdownPosition && (
          <SubDropdown
            position={dropdownPosition}
            toggleDropdown={this.toggleDropdown}
            width={dropdownWidth}
            direction={direction}
            modalStyle={modalStyle}
          >
            {children}
          </SubDropdown>
        )}
      </button>
    );
  }
}
