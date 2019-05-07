import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { debounce } from "lodash";
import * as React from "react";
import { nucleotides, nucleotideWildCards } from "../../../Utils/sequence";

export default props => {
  const {
    seqSelection: { start, end, clockwise },
    seqLength,
    validateSearchSeq,
    handleKeyDown,
    handleKeyUp,
    incrementResults,
    toggleSearch,
    nextButton,
    noSearch,
    largeSearch,
    invalidSearch,
    noResults,
    searching,
    searchIndex,
    searchResults,
    clearMessages
  } = props;
  const totalResults = searchResults.length;
  let { form, mismatchForm } = props;

  let range = "All";
  if (end - start !== 0 && end - start !== seqLength) {
    let serialStart = clockwise ? start + 1 : start;
    const serialEnd = clockwise ? end : end + 1;
    if (start % seqLength === 0) serialStart = clockwise ? 1 : seqLength;
    range = `${serialStart} to ${serialEnd}`;
  }

  /** update the current search value with mismatch selection */
  let handleMismatchChange = mismatchValue => {
    const { value } = form;
    let mismatch = 0;
    if (mismatchValue) mismatch = mismatchValue;

    validateSearchSeq(value, mismatch);
  };

  handleMismatchChange = debounce(handleMismatchChange, 450);

  // Generate a string tooltip of the nucleotides
  const nucleotideList = Object.keys(nucleotides)
    .join(", ")
    .toUpperCase();

  // Generate a string tooltip of the nucleotide wildcards
  const nucleotideWildCardList = Object.keys(nucleotideWildCards)
    .reduce(
      (list, wildcard) =>
        `${list}\n${wildcard}: ${Object.keys(
          nucleotideWildCards[wildcard]
        ).join(", ")}`,
      ""
    )
    .toUpperCase()
    .trim();

  return (
    <div className="dropdown-find-form" key="dropdown-find-form">
      <div className="Find-container upper">
        <input
          id="searchForm"
          type="text"
          name="searchForm"
          ref={s => {
            form = s;
          }}
          placeholder="Search sequence for bases"
          onChange={e => validateSearchSeq(e.target.value, mismatchForm.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={clearMessages}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          autoFocus
        />
        <label id="results" htmlFor="searchForm">
          {totalResults > 0 &&
            `${searchIndex === 0 ? 1 : searchIndex + 1}/${totalResults}`}
        </label>
        <FontAwesomeIcon
          icon={faChevronUp}
          role="button"
          onClick={() => incrementResults(false)}
        />
        <FontAwesomeIcon
          icon={faChevronDown}
          role="button"
          className={nextButton ? "nextButton-active" : "nextButton"}
          onClick={() => incrementResults(true)}
        />
        <FontAwesomeIcon
          icon={faTimes}
          role="button"
          onClick={() => toggleSearch(false)}
        />
      </div>
      <div className="Find-container lower">
        <div className="Find-mismatch">
          <label id="mismatch" htmlFor="mismatchForm">
            Mismatches
          </label>
          <input
            id="mismatchForm"
            type="number"
            name="mismatchForm"
            placeholder="0"
            onChange={e => handleMismatchChange(e.target.value)}
            ref={m => {
              mismatchForm = m;
            }}
            min="0"
          />
        </div>
        <div className="Find-range">
          <label id="mismatch" htmlFor="mismatchForm">
            Searching range: {range}
          </label>
        </div>
      </div>
      {invalidSearch && (
        <div>
          <span className="search-message">Search only supports</span>
          <span className="search-message-tooltip" title={nucleotideList}>
            nucleotide bases
          </span>
          <span className="search-message">and</span>
          <span
            className="search-message-tooltip"
            title={nucleotideWildCardList}
          >
            nucleotide wildcards.
          </span>
        </div>
      )}
      {noSearch && !invalidSearch && (
        <span className="search-message">
          Search too broad, please narrow parameters.
        </span>
      )}
      {largeSearch && !noSearch && !invalidSearch && (
        <span className="search-message">
          Search has many results, please wait.
        </span>
      )}
      {noResults && (
        <div>
          <span className="search-message">No matches found.</span>
        </div>
      )}
      {searching && (
        <div>
          <span className="search-message">Searching ...</span>
        </div>
      )}
    </div>
  );
};
