import * as React from "react";

import CentralIndexContext from "../centralIndexContext";
import { Size } from "../elements";
import { isEqual } from "../isEqual";
import { linearOneRowScroller } from "../style";

interface InfiniteHorizontalScrollProps {
  blockWidths: number[];
  bpsPerBlock: number;
  seqBlocks: JSX.Element[];
  size: Size;
  totalWidth: number;
}

interface InfiniteHorizontalScrollState {
  centralIndex: number;
  visibleBlocks: number[];
}

/**
 * InfiniteHorizontalScroll is a wrapper around the seqBlocks. Renders only the seqBlocks that are
 * within the range of the current dom viewerport
 *
 * This component should sense scroll events and, during one, recheck which sequences are shown.
 */
export class InfiniteHorizontalScroll extends React.PureComponent<
  InfiniteHorizontalScrollProps,
  InfiniteHorizontalScrollState
> {
  static contextType = CentralIndexContext;
  static context: React.ContextType<typeof CentralIndexContext>;
  declare context: React.ContextType<typeof CentralIndexContext>;

  scroller: React.RefObject<HTMLDivElement> = React.createRef(); // ref to a div for scrolling
  insideDOM: React.RefObject<HTMLDivElement> = React.createRef(); // ref to a div inside the scroller div
  timeoutID;

  constructor(props: InfiniteHorizontalScrollProps) {
    super(props);

    this.state = {
      centralIndex: 0,
      // start off with first 1 blocks shown
      visibleBlocks: new Array(Math.min(1, props.seqBlocks.length)).fill(null).map((_, i) => i),
    };
  }

  componentDidMount = () => {
    this.handleScrollOrResize(); // ref should now be set
    window.addEventListener("resize", this.handleScrollOrResize);
  };

  componentDidUpdate = (
    prevProps: InfiniteHorizontalScrollProps,
    prevState: InfiniteHorizontalScrollState,
    snapshot: { blockIndex: number; blockX: number }
  ) => {
    if (!this.scroller.current) {
      // scroller not mounted yet
      return;
    }

    const { seqBlocks, size } = this.props;
    const { centralIndex, visibleBlocks } = this.state;

    if (this.context && centralIndex !== this.context.linear) {
      this.scrollToCentralIndex();
    } else if (!isEqual(prevProps.size, size) || seqBlocks.length !== prevProps.seqBlocks.length) {
      this.handleScrollOrResize(); // reset
    } else if (isEqual(prevState.visibleBlocks, visibleBlocks)) {
      this.restoreSnapshot(snapshot); // something, like ORFs or index view, has changed
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.handleScrollOrResize);
  };

  /**
   * more info at: https://reactjs.org/docs/react-component.html#getsnapshotbeforeupdate
   */
  getSnapshotBeforeUpdate = (prevProps: InfiniteHorizontalScrollProps) => {
    // find the current left block
    const left = this.scroller.current ? this.scroller.current.scrollLeft : 0;

    // find out 1) which block this is at the edge of the left
    // and 2) how far from the left of that block we are right now
    const { blockWidths } = prevProps;
    let blockIndex = 0;
    let accumulatedX = 0;
    do {
      accumulatedX += blockWidths[blockIndex];
      blockIndex += 1;
    } while (accumulatedX + blockWidths[blockIndex] < left && blockIndex < blockWidths.length);

    const blockX = left - accumulatedX; // last extra distance
    return { blockIndex, blockX };
  };

  /**
   * Scroll to centralIndex. Likely from circular clicking on an element
   * that should then be scrolled to in linear
   */
  scrollToCentralIndex = () => {
    if (!this.scroller.current) {
      return;
    }

    const {
      blockWidths,
      bpsPerBlock,
      seqBlocks,
      size: { width },
      totalWidth,
    } = this.props;
    const { visibleBlocks } = this.state;
    const { clientWidth, scrollWidth } = this.scroller.current;
    const centralIndex = this.context.linear;

    // find the first block that contains the new central index
    const centerBlockIndex = seqBlocks.findIndex(
      block => block.props.firstBase <= centralIndex && block.props.firstBase + bpsPerBlock >= centralIndex
    );

    // build up the list of blocks that are visible just after this first block
    let newVisibleBlocks: number[] = [];
    if (scrollWidth <= clientWidth) {
      newVisibleBlocks = visibleBlocks;
    } else if (centerBlockIndex > -1) {
      const centerBlock = seqBlocks[centerBlockIndex];

      // create some padding to the left of the new center block
      const leftAdjust = centerBlockIndex > 0 ? blockWidths[centerBlockIndex - 1] : 0;
      let left = centerBlock.props.x - leftAdjust;
      let right = left + width;
      if (right > totalWidth) {
        right = totalWidth;
        left = totalWidth - width;
      }

      blockWidths.reduce((total, w, i) => {
        if (total >= left && total <= right) {
          newVisibleBlocks.push(i);
        }
        return total + w;
      }, 0);

      this.scroller.current.scrollLeft = centerBlock.props.x;
    }

    if (newVisibleBlocks.length && !isEqual(newVisibleBlocks, visibleBlocks)) {
      this.setState({
        centralIndex: centralIndex,
        visibleBlocks: newVisibleBlocks,
      });
    }
  };

  /**
   * the component has mounted to the DOM or updated, and the window should be scrolled
   * so that the central index is visible
   */
  restoreSnapshot = snapshot => {
    if (!this.scroller.current) {
      return;
    }

    const { blockWidths } = this.props;
    const { blockIndex, blockX } = snapshot;

    const scrollLeft = blockWidths.slice(0, blockIndex).reduce((acc, w) => acc + w, 0) + blockX;

    this.scroller.current.scrollLeft = scrollLeft;
  };

  /**
   * check whether the blocks that should be visible have changed from what's in state,
   * update if so
   */
  handleScrollOrResize = () => {
    if (!this.scroller.current || !this.insideDOM.current) {
      return;
    }

    const {
      blockWidths,
      size: { width },
      totalWidth,
    } = this.props;
    const { visibleBlocks } = this.state;

    const newVisibleBlocks: number[] = [];

    let left = 0;
    if (this.scroller && this.insideDOM) {
      const { left: parentLeft } = this.scroller.current.getBoundingClientRect();
      const { left: childLeft } = this.insideDOM.current.getBoundingClientRect();
      left = childLeft - parentLeft;
    }

    left = -left + 35;
    left = Math.max(0, left); // don't go too left
    left = Math.min(totalWidth - width, left); // don't go too right
    const right = left + blockWidths[0]; // width;
    left -= blockWidths[0]; // add one block padding on left
    blockWidths.reduce((total, w, i) => {
      if (total >= left && total <= right) {
        newVisibleBlocks.push(i);
      }
      return total + w;
    }, 0);

    if (!isEqual(newVisibleBlocks, visibleBlocks)) {
      this.setState({ visibleBlocks: newVisibleBlocks });
    }
  };

  incrementScroller = incAmount => {
    this.stopIncrementingScroller();
    this.timeoutID = setTimeout(() => {
      if (!this.scroller.current) {
        return;
      }

      this.scroller.current.scrollLeft += incAmount;
      this.incrementScroller(incAmount);
    }, 5);
  };

  stopIncrementingScroller = () => {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
    }
  };

  /**
   * handleMouseOver is for detecting when the user is performing a drag event
   * at the very left or the very right of DIV. If they are, this starts
   * a incrementing the div's scrollLeft (ie a horizontal scroll event) that's
   * terminated by the user leaving the scroll area
   *
   * The rate of the scrollLeft is proportional to how far from the left or the
   * bottom the user is (within [-40, 0] for left, and [0, 40] for right)
   */
  handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!this.scroller.current) {
      return;
    }

    // not relevant, some other type of event, not a selection drag
    if (e.buttons !== 1) {
      if (this.timeoutID) {
        this.stopIncrementingScroller();
      }
      return;
    }

    // check whether the current drag position is near the right
    // of the viewer and, if it is, try and increment the current
    // centralIndex (triggering a right scroll event)
    const scrollerBlock = this.scroller.current.getBoundingClientRect();
    let scrollRatio = (e.clientX - scrollerBlock.left) / scrollerBlock.width;
    if (scrollRatio > 0.9) {
      scrollRatio = Math.min(1, scrollRatio);
      let scalingRatio = scrollRatio - 0.9;
      scalingRatio *= 10;
      const scaledScroll = 15 * scalingRatio;

      this.incrementScroller(scaledScroll);
    } else if (scrollRatio < 0.1) {
      scrollRatio = 0.1 - Math.max(0, scrollRatio);
      const scalingRatio = 10 * scrollRatio;
      const scaledScroll = -15 * scalingRatio;

      this.incrementScroller(scaledScroll);
    } else {
      this.stopIncrementingScroller();
    }
  };

  render() {
    const {
      blockWidths,
      seqBlocks,
      size: { height },
      totalWidth: width,
    } = this.props;
    const { visibleBlocks } = this.state;

    // find the width of the empty div needed to correctly position the rest
    const [firstRendered] = visibleBlocks;
    const spaceLeft = blockWidths.slice(0, firstRendered).reduce((acc, w) => acc + w, 0);
    return (
      <div
        ref={this.scroller}
        className="la-vz-linear-one-row-scroller"
        data-testid="la-vz-viewer-linear"
        style={linearOneRowScroller}
        onFocus={() => {
          // do nothing
        }}
        onMouseOver={this.handleMouseOver}
        onScroll={this.handleScrollOrResize}
      >
        <div
          ref={this.insideDOM}
          className="la-vz-linear-one-row-seqblock-container"
          style={{ display: "flex", flexDirection: "row", width: Number.isNaN(width) ? "100%" : width }}
        >
          <div className="la-vz-seqblock-padding-left" style={{ height: height || 0, width: spaceLeft }} />
          {visibleBlocks.map(i => seqBlocks[i])}
        </div>
      </div>
    );
  }
}
