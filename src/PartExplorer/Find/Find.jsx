import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { debounce, isEqual } from "lodash";
import * as React from "react";
import {
  nucleotides,
  nucleotideWildCards,
  translateWildNucleotides
} from "../../Utils/sequence";
import "./Find.scss";
import FindRange from "./FindRange/FindRange";

class Find extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextButton: false,
      noSearch: false,
      largeSearch: false,
      invalidSearch: false,
      noResults: false,
      searching: false
    };
    this.searchSeq = debounce(this.searchSeq, 450);
    this.generateSearchWarnings = debounce(this.generateSearchWarnings, 350);
  }

  componentDidMount = () => {
    window.addEventListener("keydown", this.searchHotKey);
  };

  componentWillUnmount = () => {
    window.removeEventListener("keydown", this.searchHotKey);
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const { findState, seqSelection } = this.props;

    if (!isEqual(findState, nextProps.findState)) return true;

    if (!isEqual(this.state, nextState)) return true;

    return !isEqual(seqSelection, nextProps.seqSelection);
  };

  /** Bind Ctr + F for showing search modal and ESC for hiding search modal */
  searchHotKey = e => {
    const { keyCode, metaKey } = e;
    if (keyCode === 70 && metaKey) {
      e.preventDefault();
      this.toggleSearch(null);
    } else if (keyCode === 27) {
      this.toggleSearch(false);
    }
  };

  /**
   * The setFindSelection passes information to the individual find renderers
   * for determining what to highlight e.g. CircularFind
   * The SetCentralIndex allows the jumping to search selection
   * The target param skips focuses directly to the selected highlight.
   */
  searchController = (searchResArray, newSearchIndex, target) => {
    const {
      findState: { searchResults },
      setPartState
    } = this.props;
    const newSearchResults = searchResArray || searchResults;
    if (target) {
      const result = newSearchResults.find(s => s.start === target);
      if (result) {
        newSearchIndex = result.index;
      }
    }

    if (
      newSearchResults[newSearchIndex] &&
      newSearchResults[newSearchIndex].start
    ) {
      const { start: newCentralIndex } = newSearchResults[newSearchIndex];
      setPartState({
        findState: {
          searchResults: newSearchResults,
          searchIndex: newSearchIndex
        },
        circularCentralIndex: newCentralIndex,
        linearCentralIndex: newCentralIndex
      });
    } else {
      setPartState({
        findState: {
          searchResults: newSearchResults,
          searchIndex: newSearchIndex
        }
      });
    }
    this.clearMessages();
  };

  handleKeyDown = e => {
    const { keyCode, target } = e;
    if (keyCode === 13 && target.value.length) {
      this.incrementResults(true);
      this.setState({ nextButton: true });
    }
  };

  handleKeyUp = e => {
    const { keyCode, target } = e;
    if (keyCode === 13 && target.value.length) {
      this.setState({ nextButton: false });
    }
  };

  /**
   * findWithMismatch
   * A slightly modified Hamming Distance algorithm for approximate
   * string Matching for patterns
   */
  findWithMismatch = searchParams => {
    const { query, targetString, mismatch, offset, template } = searchParams;
    const results = [];
    const indexMax = targetString.length - query.length;

    for (let targetIndex = 0; targetIndex < indexMax; targetIndex += 1) {
      let missed = 0;

      for (let queryIndex = 0; queryIndex < query.length; queryIndex += 1) {
        const targetChar = targetString[targetIndex + queryIndex];
        const queryChar = query[queryIndex];
        if (nucleotides[queryChar]) {
          if (targetChar !== queryChar) missed += 1;
        } else if (nucleotideWildCards[queryChar]) {
          if (!nucleotideWildCards[queryChar][targetChar]) missed += 1;
        }
        if (missed > mismatch) break;
      }
      if (missed <= mismatch) {
        results.push({ loc: targetIndex + offset, row: template ? 0 : 1 });
      }
    }

    return results;
  };

  /**
   * findString
   * create an array of locations of the found substring, given the search term
   * and the target string to search through
   * row specifies whether the search result is on the template strand or complement
   */
  findString = (params, template) => {
    const { seqLength } = this.props;
    const { query, targetString, mismatch, offset } = params;
    const indices = [];

    const translatedQuery = translateWildNucleotides(query).trim();

    if (mismatch > 0) {
      const searchParams = {
        query,
        targetString,
        mismatch,
        offset,
        template
      };
      return this.findWithMismatch(searchParams);
    }
    const regex = new RegExp(translatedQuery, "gi");

    let result = regex.exec(targetString);
    while (result) {
      indices.push({
        loc: (result.index + offset) % seqLength,
        row: template ? 0 : 1
      });
      result = regex.exec(targetString);
    }
    return indices;
  };

  /**
   * createSelectionSubstring
   * For range-based search, returns a substring and the offset index determined by the
   * condition, ie. crosses zero index or not, etc.
   * Returns entire seq/compSeq otherwise
   */
  createSelectionSubstring = query => {
    const {
      seq,
      compSeq,
      seqLength,
      seqSelection: { start, end, clockwise }
    } = this.props;
    let [tempTarget, compTarget, offset] = [seq, compSeq, 0];

    // to account for results that cross the zero index
    if (end - start === 0) {
      return [
        seq.repeat(2).substring(0, seqLength + query.length - 1),
        compSeq.repeat(2).substring(0, seqLength + query.length - 1),
        0
      ];
    }

    if (start > end) {
      if (clockwise) {
        tempTarget = tempTarget.repeat(2).substring(start, end + seqLength);
        compTarget = compTarget.repeat(2).substring(start, end + seqLength);
        offset = start;
      } else {
        tempTarget = tempTarget.substring(end, start);
        compTarget = compTarget.substring(end, start);
        offset = end;
      }
    } else if (end > start) {
      if (clockwise) {
        tempTarget = tempTarget.substring(start, end);
        compTarget = compTarget.substring(start, end);
        offset = start;
      } else {
        tempTarget = tempTarget.repeat(2).substring(end, start + seqLength);
        compTarget = compTarget.repeat(2).substring(end, start + seqLength);
        offset = end;
      }
    }

    return [tempTarget, compTarget, offset];
  };

  /**
   * Check that the query warrants a search
   * Also determines whether no search or invalid search
   * messages need to be displayed.
   * This is separate from the debounced searchSeq
   * in order for the messages to render quickly
   */
  validateSearchSeq = (query, mismatch) => {
    // Clear previous search results and messages when a new search starts
    // This helps make it clear that a search is going on
    this.clearResults();
    this.clearMessages();
    this.setState({ searching: true });
    // Only start searching after query is at least 3 letters
    // which is the length of a codon, probably the lowest
    // meaningful number of letters for a search
    // this prevents initial searches with ridiculous number or
    // search results during the type ahead
    if (query.length - mismatch < 3) {
      this.clearResults();
      this.setState({ noSearch: true });
      return;
    }
    this.setState({ noSearch: false });

    // Only start searching if search sequence contains recognized characters
    const translatedQuery = translateWildNucleotides(
      query.toLowerCase()
    ).trim();
    const regTest = new RegExp(
      `[^${Object.keys(nucleotides).join("")}()|]`,
      "gi"
    );
    if (regTest.test(translatedQuery)) {
      this.clearResults();
      this.setState({ invalidSearch: true });
      return;
    }
    this.setState({ invalidSearch: false });

    this.generateSearchWarnings(query, mismatch);
  };

  /**
   * Wrapper around search that checks if warning messages
   * need to be made based on search results
   */
  generateSearchWarnings = (query, mismatch) => {
    const revValue = query
      .split("")
      .reverse()
      .join("");

    const [tempTarget, compTarget, offset] = this.createSelectionSubstring(
      query
    );
    const tempSearchParams = {
      query: query,
      targetString: tempTarget,
      mismatch: mismatch,
      offset: offset
    };
    const compSearchParams = {
      query: revValue,
      targetString: compTarget,
      mismatch: mismatch,
      offset: offset
    };

    const indices = this.findString(tempSearchParams, true);

    const compIndices = this.findString(compSearchParams, false);

    // If results are greater than 4000 on either strand
    // throw out the search and tell user the search was too broad
    if (indices.length > 4000 || compIndices.length > 4000) {
      this.clearResults();
      this.setState({ noSearch: true });
      return;
    }
    this.setState({ noSearch: false });

    // If results are greater than 200 on either strand
    // warn the user the search will take a while to render
    if (indices.length > 200 || compIndices.length > 200) {
      this.setState({ largeSearch: true });
    } else {
      this.setState({ largeSearch: false });
    }

    // If there are no results, say so
    if (indices.length === 0 && compIndices.length === 0) {
      this.clearResults();
      this.setState({ noResults: true });
    } else {
      this.setState({ noResults: false });
    }

    this.searchSeq(indices, compIndices, query.length);
  };

  /**
   * searchSeq
   * For the reverse compliment, the search term is reversed before being sent to the Regex
   * function above
   */
  searchSeq = (indices, compIndices, queryLength) => {
    const { seqLength } = this.props;
    const fullResult = [...new Set([...indices, ...compIndices])].sort(
      (a, b) => a.loc - b.loc
    );

    const preProcessSearch = fullResult.map((s, i) => {
      const end = s.loc + queryLength;
      const overflowEnd = end % seqLength;
      return {
        start: s.loc,
        end: overflowEnd > 0 ? overflowEnd : seqLength,
        row: s.row,
        index: i
      };
    });
    this.searchController(preProcessSearch, 0, null);
  };

  /**
   * incrementResults
   * Traverse the search results array and return a search index via a prop callback to
   * tell the viewer what to highlight
   */
  incrementResults = fwd => {
    this.clearMessages();
    const {
      findState: { searchResults = [], searchIndex }
    } = this.props;
    let newSearchIndex = searchIndex;
    if (searchResults.length) {
      const lastIndex = searchResults.length - 1;
      if (fwd) {
        newSearchIndex += 1;
        if (newSearchIndex > lastIndex) newSearchIndex = 0;
      } else {
        newSearchIndex -= 1;
        if (newSearchIndex < 0) newSearchIndex = lastIndex;
      }
      this.searchController(searchResults, newSearchIndex, null);
    }
  };

  /**
   * Clear search messages
   */
  clearMessages = () => {
    this.setState({
      noSearch: false,
      largeSearch: false,
      invalidSearch: false,
      noResults: false,
      searching: false
    });
  };

  /**
   * Clear search results
   */
  clearResults = () => {
    this.searchController([], 0, null);
  };

  searchForm;

  mismatchForm;

  render() {
    const {
      findState: { searchResults = [], searchIndex },
      seq,
      seqSelection
    } = this.props;
    const {
      nextButton,
      noSearch,
      largeSearch,
      invalidSearch,
      noResults,
      searching
    } = this.state;

    return (
      <React.Fragment>
        <FontAwesomeIcon
          className="dropdown-find"
          icon={faSearch}
          role="button"
          onClick={() => this.toggleSearch(!showSearch)}
        />
        {
          <FindRange
            form={this.searchForm}
            seqSelection={seqSelection}
            seqLength={seq.length}
            validateSearchSeq={this.validateSearchSeq}
            handleKeyDown={this.handleKeyDown}
            handleKeyUp={this.handleKeyUp}
            incrementResults={this.incrementResults}
            toggleSearch={this.toggleSearch}
            mismatchForm={this.mismatchForm}
            nextButton={nextButton}
            noSearch={noSearch}
            largeSearch={largeSearch}
            invalidSearch={invalidSearch}
            noResults={noResults}
            searching={searching}
            searchIndex={searchIndex}
            searchResults={searchResults}
            clearMessages={this.clearMessages}
            onClick={this.clearMessages}
          />
        }
      </React.Fragment>
    );
  }
}

export default Find;
