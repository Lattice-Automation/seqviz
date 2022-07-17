import { NameRange, Range } from "../elements";

// utility funcs for stackElements
const last = <T extends Range>(arr: T[]): T => arr[arr.length - 1];
const first = <T extends Range>(arr: T[]): T => arr[0];

/**
 * Take an array of elements and create a 2D array where non-overlapping elements are in
 * the same row. Example:
 *
 * input (`T[]`):
 * ```
 * 		[ ---Ann---	---Ann3---
 * 			 ---Ann2--- ]
 * ```
 *
 * output (`T[][]`):
 * ```
 * 		[ ---Ann--- ---Ann3---]
 * 		[		---Ann2---    ]
 * ```
 */
export const stackElements = <T extends NameRange>(elements: T[], seqL: number): T[][] =>
  [...elements].reduce((acc: T[][], a) => {
    const insertIndex = acc.findIndex(elems => {
      if (a.end === a.start) {
        // the element has the same start and end index and therefore the whole
        // plasmid (so it shouldn't fit into any existing row)
        return false;
      }
      if (last(elems).end <= last(elems).start) {
        // the last element in this row crosses zero index
        return last(elems).end + seqL <= a.start;
      }
      if (a.end > a.start) {
        // this element doesn't cross the zero index and the last in row doesn't
        return last(elems).end <= a.start;
      }
      // both this curr element and the last in the row cross the zero index
      return last(elems).end < a.start && a.end < first(elems).start;
    });

    if (insertIndex > -1) {
      // insert in the row where it's the new highest
      acc[insertIndex].push(a);
    } else {
      // create a new row for this entry
      acc.push([a]);
    }
    return acc;
  }, []);

/**
 * given an array of arrays of an element, fragment the element into seq blocks
 *
 * this is needed in the Linear sequence viewer because it's easier to send only the
 * relevant elements to the child SeqBlocks, rather to send every SeqBlock everything
 * and have the block figure out whether element is included within it
 *
 * NOTE: if an element has a start and end index that are the same, it's assumed to
 * cover the entire plasmid
 */
export const createMultiRows = <T extends NameRange>(elements: T[][], rowLength: number, rowCount: number): T[][][] => {
  const newArr: T[][][] = new Array(rowCount);

  // initialize the nested rows in each block
  for (let i = 0; i < rowCount; i += 1) {
    newArr[i] = [];
    for (let j = 0; j < elements.length; j += 1) {
      newArr[i][j] = [];
    }
  }

  // for each row of input
  for (let i = 0; i < elements.length; i += 1) {
    // for each element in that row
    for (let j = 0; j < elements[i].length; j += 1) {
      // if the element doesn't cross the zero index
      if (elements[i][j].start < elements[i][j].end) {
        // between the elements start and end, add to every seqBlock
        // within its range

        // this element doesn't cross the zero index and doesn't cover
        // the whole plasmid
        let k = Math.max(0, Math.floor(elements[i][j].start / rowLength));
        const end = Math.floor((elements[i][j].end - 1) / rowLength);

        while (k <= end && k < rowCount) {
          newArr[k][i].push(elements[i][j]);
          k += 1;
        }
      } else if (elements[i][j].end < elements[i][j].start) {
        // the element crosses the zero index and doesn't cover the whole plasmid

        // first, push onto all arrays from the end down to the zero
        let e = Math.floor((elements[i][j].end - 1) / rowLength);
        if (elements[i][j].end === 0) {
          // handle an edge case where element ends at 0-index
          e = -1; // skip adding to rows
        }
        while (e >= 0 && e < newArr.length) {
          newArr[e][i].push(elements[i][j]);
          e -= 1;
        }

        // then push onto all arrays from the start to the end
        let s = Math.floor(elements[i][j].start / rowLength);
        while (s < rowCount) {
          newArr[s][i].push(elements[i][j]);
          s += 1;
        }
      } else if (elements[i][j].end === elements[i][j].start) {
        // the element circles the entire plasmid and, therefore, fills every
        // SeqBlock. start === end is signal for covering whole plasmid
        for (let a = 0; a < newArr.length; a += 1) {
          newArr[a][i].push(elements[i][j]);
        }

        // edge case where starts and ends at 0
        if (elements[i][j].end === 0) {
          continue;
        }

        // and add again for the block that the element starts in
        const s = Math.floor(elements[i][j].start / rowLength);
        newArr[s][i].push(elements[i][j]);
      }
    }
  }

  // filter out the empty rows in each block
  for (let i = 0; i < rowCount; i += 1) {
    newArr[i] = newArr[i].filter(a => a[0]);
  }
  return newArr;
};

/**
 * Given an array of elements and an interval (`rowLength`), bin elements into rows.
 *
 * This is used by the Linear viewer for CutSites and Highlights where it's okay for
 * elements to overlap one another.
 */
export const createSingleRows = <T extends NameRange>(
  elements: T[],
  rowLength: number,
  rowCount: number,
  duplicateIdsAllowed = true
): T[][] => {
  const newArr: T[][] = new Array(rowCount);

  // initialize the nested rows in each block
  for (let i = 0; i < rowCount; i += 1) {
    newArr[i] = [];
  }

  // assign each element to its respective array
  for (let i = 0; i < elements.length; i += 1) {
    let { end, start } = elements[i];

    // special case for enzymes that have cut-sites away from recog (BsaI)
    // @ts-expect-error this is some hack for cut-sites
    if (elements[i].fcut !== undefined) {
      // @ts-expect-error this is some hack for cut-sites
      const { fcut, rcut } = elements[i];
      start = fcut > end || fcut < start ? fcut : start;
      end = rcut > end || rcut < start ? rcut : end;
    }

    if (start < end) {
      let k = Math.floor(start / rowLength);
      const rowEnd = Math.floor((end - 1) / rowLength);

      while (k <= rowEnd && k < rowCount) {
        newArr[k].push(elements[i]);
        k += 1;
      }
    } else {
      // the element crosses the zero index
      // first, push onto all arrays from the end down to the zero
      let e = Math.floor(end / rowLength);
      while (e >= 0) {
        newArr[e].push(elements[i]);
        e -= 1;
      }

      // then push onto all arrays from the start to the end
      let s = Math.floor(start / rowLength);
      while (s < rowCount) {
        // only add to the array if the user is okay with having duplicates by id.
        // for example, this shouldn't be allowed if multiple translation rows have
        // the same ID
        if (duplicateIdsAllowed || newArr[s].every(el => el.id !== elements[i].id)) {
          newArr[s].push(elements[i]);
        }
        s += 1;
      }
    }
  }

  return newArr;
};
