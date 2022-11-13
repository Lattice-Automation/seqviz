import * as React from "react";

import CentralIndexContext from "../centralIndexContext";
import { Size } from "../elements";
import isEqual from "../isEqual";

interface InfiniteScrollProps {
  blockHeights: number[];
  bpsPerBlock: number;
  seqBlocks: JSX.Element[];
  size: Size;
  totalHeight: number;
}

interface InfiniteScrollState {
  centralIndex: number;
  visibleBlocks: number[];
}

/**
 * InfiniteScroll is a wrapper around the seqBlocks. Renders only the seqBlocks that are
 * within the range of the current dom viewerport
 *
 * This component should sense scroll events and, during one, recheck which sequences are shown.
 */
export default class InfiniteScroll extends React.PureComponent<InfiniteScrollProps, InfiniteScrollState> {
  static contextType = CentralIndexContext;
  static context: React.ContextType<typeof CentralIndexContext>;
  declare context: React.ContextType<typeof CentralIndexContext>;

  /** ref to a div that's for scrolling: https://flow.org/en/docs/react/types/ */
  scroller;
  insideDOM;
  timeoutID;

  constructor(props: InfiniteScrollProps) {
    super(props);

    this.state = {
      centralIndex: 0,
      // start off with first 5 blocks shown
      visibleBlocks: new Array(Math.min(5, props.seqBlocks.length)).fill(null).map((_, i) => i),
    };
    this.scroller = React.createRef();
    this.insideDOM = React.createRef();
  }

  componentDidMount = () => {
    this.handleScrollOrResize(); // ref should now be set
    window.addEventListener("resize", this.handleScrollOrResize);
  };

  componentDidUpdate = (prevProps: InfiniteScrollProps, prevState: InfiniteScrollState, snapshot: any) => {
    if (!this.scroller) {
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
  getSnapshotBeforeUpdate = (prevProps: InfiniteScrollProps) => {
    // find the current top block
    const top = this.scroller ? this.scroller.current.scrollTop : 0;

    // find out 1) which block this is at the edge of the top
    // and 2) how far from the top of that block we are right now
    const { blockHeights } = prevProps;
    let blockIndex = 0;
    let accumulatedY = 0;
    do {
      accumulatedY += blockHeights[blockIndex];
      blockIndex += 1;
    } while (accumulatedY + blockHeights[blockIndex] < top && blockIndex < blockHeights.length);

    const blockY = top - accumulatedY; // last extra distance
    return { blockIndex, blockY };
  };

  /**
   * Scroll to centralIndex. Likely from circular clicking on an element
   * that should then be scrolled to in linear
   */
  scrollToCentralIndex = () => {
    const {
      blockHeights,
      bpsPerBlock,
      seqBlocks,
      size: { height },
      totalHeight,
    } = this.props;
    const { visibleBlocks } = this.state;
    const { clientHeight, scrollHeight } = this.scroller.current;
    const centralIndex = this.context.linear;

    // find the first block that contains the new central index
    const centerBlockIndex = seqBlocks.findIndex(
      block => block.props.firstBase <= centralIndex && block.props.firstBase + bpsPerBlock >= centralIndex
    );

    // build up the list of blocks that are visible just beneath this first block
    let newVisibleBlocks: number[] = [];
    if (scrollHeight <= clientHeight) {
      newVisibleBlocks = visibleBlocks;
    } else if (centerBlockIndex > -1) {
      const centerBlock = seqBlocks[centerBlockIndex];

      // create some padding above the new center block
      const topAdjust = centerBlockIndex > 0 ? blockHeights[centerBlockIndex - 1] : 0;
      let top = centerBlock.props.y - topAdjust;
      let bottom = top + height;
      if (bottom > totalHeight) {
        bottom = totalHeight;
        top = totalHeight - height;
      }
      blockHeights.reduce((total, h, i) => {
        if (total >= top && total <= bottom) {
          newVisibleBlocks.push(i);
        }
        return total + h;
      }, 0);

      // Don't scroll exactly to centralIndex because most of the time
      // item of interest is at centralIndex and if this is at the top
      // it can be obscured by things like the search box
      this.scroller.current.scrollTop = centerBlock.props.y - blockHeights[0] / 2;
    }

    if (!isEqual(newVisibleBlocks, visibleBlocks)) {
      this.setState({
        centralIndex: centralIndex,
        visibleBlocks: newVisibleBlocks,
      });
    }
  };

  /**
   * the component has mounted to the DOM or updated, and the window should be scrolled downwards
   * so that the central index is visible
   */
  restoreSnapshot = snapshot => {
    const { blockHeights } = this.props;
    const { blockIndex, blockY } = snapshot;

    const scrollTop = blockHeights.slice(0, blockIndex).reduce((acc, h) => acc + h, 0) + blockY;

    this.scroller.current.scrollTop = scrollTop;
  };

  /**
   * check whether the blocks that should be visible have changed from what's in state,
   * update if so
   */
  handleScrollOrResize = () => {
    const {
      blockHeights,
      size: { height },
      totalHeight,
    } = this.props;
    const { visibleBlocks } = this.state;

    const newVisibleBlocks: number[] = [];

    let top = 0;
    if (this.scroller && this.insideDOM) {
      const { top: parentTop } = this.scroller.current.getBoundingClientRect();
      const { top: childTop } = this.insideDOM.current.getBoundingClientRect();
      top = childTop - parentTop;
    }

    top = -top + 35;
    top = Math.max(0, top); // don't go too high
    top = Math.min(totalHeight - height, top); // don't go too low
    const bottom = top + height;
    top -= 2 * blockHeights[0]; // add two blocks padding on top
    blockHeights.reduce((total, h, i) => {
      if (total >= top && total <= bottom) {
        newVisibleBlocks.push(i);
      }
      return total + h;
    }, 0);

    if (!isEqual(newVisibleBlocks, visibleBlocks)) {
      this.setState({ visibleBlocks: newVisibleBlocks });
    }
  };

  incrementScroller = incAmount => {
    this.stopIncrementingScroller();
    this.timeoutID = setTimeout(() => {
      this.scroller.current.scrollTop += incAmount;
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
   * at the very top or the very bottom of DIV. If they are, this starts
   * a incrementing the div's scrollTop (ie an upward or downward scroll event) that's
   * terminated by the user leaving the scroll area
   *
   * The rate of the scrollTop is proportional to how far from the top or the
   * bottom the user is (within [-40, 0] for top, and [0, 40] for bottom)
   */
  handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    // not relevant, some other type of event, not a selection drag
    if (e.buttons !== 1) {
      if (this.timeoutID) {
        this.stopIncrementingScroller();
      }
      return;
    }

    // check whether the current drag position is near the bottom or the
    // top of the viewer and, if it is, try and increment the current
    // centralIndex (triggering a downward scroll event)
    const scrollerBlock = this.scroller.current.getBoundingClientRect();
    let scrollRatio = (e.clientY - scrollerBlock.top) / scrollerBlock.height;
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
      blockHeights,
      seqBlocks,
      size: { width },
      totalHeight: height,
    } = this.props;
    const { visibleBlocks } = this.state;

    // find the height of the empty div needed to correctly position the rest
    const [firstRendered] = visibleBlocks;
    const spaceAbove = blockHeights.slice(0, firstRendered).reduce((acc, h) => acc + h, 0);

    return (
      <div
        ref={this.scroller}
        className="la-vz-linear-scroller"
        data-testid="la-vz-viewer-linear"
        onFocus={() => {
          // do nothing
        }}
        onMouseOver={this.handleMouseOver}
        onScroll={this.handleScrollOrResize}
      >
        <div ref={this.insideDOM} className="la-vz-seqblock-container" style={{ height }}>
          <div className="la-vz-seqblock-padding-top" style={{ height: spaceAbove, width: width || 0 }} />
          {visibleBlocks.map(i => seqBlocks[i])}
        </div>
      </div>
    );
  }
}
