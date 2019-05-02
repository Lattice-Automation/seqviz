import * as React from "react";
import { calcGC, calcTm } from "../../Utils/sequence";
import "./SelectionMetaInfo.scss";

/**
 * a container for investigating the meta and sequence information of a part
 */
class SelectionMetaInfo extends React.PureComponent {
  render() {
    const {
      part: { seq, annotations },
      seqSelection: { start, end, ref, clockwise }
    } = this.props;

    const subSeq = seq.substring(start, end);
    const gc = calcGC(subSeq);
    const tm = calcTm(subSeq);

    let selectedFeature = null;
    if (ref) {
      selectedFeature = annotations.find(a => a.id === ref);
    }

    const [s, e] = clockwise ? [start, end] : [end, start];
    const basePairsSelected = s !== e;

    return (
      <div className="selection-meta-info">
        {basePairsSelected && (
          <React.Fragment>
            <span>{`Start: ${s + 1} `}</span>
            <span>{`End: ${e} `}</span>
            <span>{`GC%: ${gc.toPrecision(2)} `}</span>
            {subSeq.length <= 70 && <span>{`Tm: ${tm}°C `}</span>}
            {selectedFeature && (
              <span>{`${selectedFeature.__typename}: ${
                selectedFeature.name
              }`}</span>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default SelectionMetaInfo;
