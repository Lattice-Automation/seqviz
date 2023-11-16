import { useState } from "react";
import { Button } from "semantic-ui-react";

import { randomID } from "../sequence";
import { PrimerModal } from "./PrimerModal";

import React = require("react");

export interface Primer {
  GCContent: string;
  end: number;
  rev: boolean;
  seq: any;
  start: number;
  temp: number;
}

export const PrimerDesign = props => {
  const [openModal, setOpenModal] = useState(false);
  const [primers, setPrimers] = useState<Primer[] | null>(null);
  const [oldPrimerSelect, setOldPrimerSelect] = useState<string>("");
  const [editButton, setEditButton] = useState(false);
  const [target, setTarget] = useState<any>(null);

  const getPrimerTemp = (sequence: string) => {
    let atCount = 0,
      gcCount = 0;

    for (let i = 0; i < sequence.length; i++) {
      const nucleotide = sequence[i].toUpperCase();
      if (nucleotide === "A" || nucleotide === "T") {
        atCount++;
      } else if (nucleotide === "G" || nucleotide === "C") {
        gcCount++;
      }
    }

    return 2 * atCount + 4 * gcCount;
  };

  const getGCContent = (sequence: string) => {
    let gcCount = 0;
    sequence = sequence.toUpperCase();
    const sequenceLength = sequence.length;

    for (let i = 0; i < sequenceLength; i++) {
      const nucleotide = sequence[i];
      if (nucleotide === "G" || nucleotide === "C") {
        gcCount++;
      }
    }

    return (gcCount / sequenceLength) * 100;
  };

  const checkValidSeq = (sequence: string) => {
    sequence = sequence.toUpperCase();
    return /^[ATCG]*$/i.test(sequence);
  };

  const reverseComplement = (seq: string) => {
    return seq
      .split("")
      .map(nucleotide => {
        switch (nucleotide) {
          case "A":
            return "T";
          case "T":
            return "A";
          case "C":
            return "G";
          case "G":
            return "C";
          default:
            return nucleotide;
        }
      })
      .reverse()
      .join("")
      .toLowerCase();
  };

  const getReversePrimer = (shift = 0, len = 25) => {
    const start = props.selection.end;
    const end = props.selection.end + (len + shift);
    let sequence = props.seq.slice(start, end);
    sequence = sequence.toUpperCase();

    return [reverseComplement(sequence), start, end];
  };

  const getForwardPrimer = (shift = 0, len = 25) => {
    const start = props.selection.start - (len + shift);
    const end = props.selection.start;
    const forwardPrimer = props.seq.slice(start, end);
    return [forwardPrimer, start, end];
  };

  const shiftPrimers = (temp: number, GCContent: number, remainingBp: string, orientation: string) => {
    let count = 0;
    let len = 25;
    let seq = "ATCG";
    let start = 0;
    let end = 0;
    while ((70 <= temp || temp <= 55 || 60 < GCContent || GCContent < 40) && count < remainingBp.length) {
      if (orientation === "rev") {
        if (len > 18) {
          const result = getReversePrimer(1, len - 1);
          seq = result[0];
          start = result[1];
          end = result[2];
          len -= 1;
        } else {
          const result = getReversePrimer(1);
          seq = result[0];
          start = result[1];
          end = result[2];
        }
      } else {
        if (len > 18) {
          const result = getForwardPrimer(1, len - 1);
          seq = result[0];
          start = result[1];
          end = result[2];
          len -= 1;
        } else {
          const result = getForwardPrimer(1);
          seq = result[0];
          start = result[1];
          end = result[2];
        }
      }

      temp = getPrimerTemp(seq);
      GCContent = getGCContent(seq);
      count += 1;
    }

    return [seq, temp, GCContent, start, end];
  };

  const handlePrimerDesign = (sequence: string) => {
    if (sequence !== oldPrimerSelect) {
      if (primers != null) {
        removePrimers();
      }
      setPrimers(null);
      const validate = checkValidSeq(sequence);

      if (validate) {
        let forward = getForwardPrimer();
        let rev = getReversePrimer();

        let GCContentFwd = getGCContent(forward[0]);
        let GCContentRev = getGCContent(rev[0]);

        let fwdTemp = getPrimerTemp(forward[0]);
        let revTemp = getPrimerTemp(rev[0]);

        let startFwd = 0;
        let endFwd = 0;
        let startRev = 0;
        let endRev = 0;

        const fwdBackwards = props.seq.slice(0, props.selection.start - 25);
        const revOnwards = props.seq.slice(props.selection.end + 25, props.seq.length - 1);

        if (
          70 <= fwdTemp ||
          fwdTemp <= 55 ||
          60 < GCContentFwd ||
          GCContentFwd < 40 ||
          Math.abs(fwdTemp - revTemp) > 5
        ) {
          const result: any = shiftPrimers(fwdTemp, GCContentFwd, fwdBackwards, "fwd");
          forward = result[0];
          fwdTemp = result[1];
          GCContentFwd = result[2];
          startFwd = result[3];
          endFwd = result[4];
        }
        if (
          70 <= revTemp ||
          revTemp <= 55 ||
          60 < GCContentRev ||
          GCContentRev < 40 ||
          Math.abs(fwdTemp - revTemp) > 5
        ) {
          const result: any = shiftPrimers(revTemp, GCContentRev, revOnwards, "rev");
          rev = result[0];
          revTemp = result[1];
          GCContentRev = result[2];
          startRev = result[3];
          endRev = result[4];
        }

        setOldPrimerSelect(sequence);
        setPrimers([
          {
            GCContent: Math.round(GCContentFwd).toString() + "%",
            end: endFwd,
            rev: false,
            seq: forward,
            start: startFwd,
            temp: fwdTemp
          },
          {
            GCContent: Math.round(GCContentRev).toString() + "%",
            end: endRev,
            rev: true,
            seq: rev,
            start: startRev,
            temp: revTemp
          },
        ]);
        setOpenModal(true);
        return;
      }
      throw "Invalid DNA sequence";
    } else {
      setOpenModal(true);
    }
  };

  const addPrimers = (primers: Primer[]) => {
    let annotations = [...props.annotations];

    primers.forEach((primer: Primer) => {
      const primerAnnotation = {
        color: primer.rev ? "blue" : "red",
        direction: primer.rev ? -1 : 1,
        end: primer.end,
        id: randomID(),
        name: primer.rev ? "primer-rev" : "primer-fwd",
        start: primer.start,
      };
      annotations = [...annotations, primerAnnotation];
    });

    const targetAnnotation = {
      color: "green",
      direction: 1,
      end: props.selection.end,
      id: randomID(),
      name: "target",
      start: props.selection.start
    };
    if (!annotations.find((annotation: any) => annotation.id === target?.id)) {
      setTarget(targetAnnotation);
      annotations = [...annotations, targetAnnotation];
    }

    props.setAnnotations(annotations);
  };

  const removePrimers = () => {
    const annotations = props.annotations.filter(
      (annotation: any) => !annotation.name.includes("primer") && !annotation.name.includes("target")
    );
    setEditButton(false);
    props.setAnnotations(annotations);
  };

  React.useEffect(() => {
    if (props.selection?.start && primers) {
      const findOne = primers.find(
        (primer: Primer) => primer.start === props.selection?.start && primer.end === props.selection?.end
      );
      if (findOne || (target?.start === props.selection?.start && target?.end === props.selection?.end)) {
        setEditButton(true);
      } else {
        setEditButton(false);
      }
    }
  }, [props.selection]);

  return (
    <div style={{ left: 250, position: "absolute", top: 14, width: "200px", zIndex: 10 }}>
      {props.primerSelect !== "" && !editButton && (
        <Button
          color="blue"
          onClick={() => {
            handlePrimerDesign(props.primerSelect);
            setOpenModal(true);
          }}
        >
          Create Primers
        </Button>
      )}
      {props.primerSelect !== "" && editButton && (
        <Button
          color="green"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          Edit Primers
        </Button>
      )}
      {primers && (
        <PrimerModal
          addPrimers={(data: Primer[]) => addPrimers(data)}
          closeModal={() => setOpenModal(false)}
          data={primers}
          open={openModal}
          removePrimers={removePrimers}
        />
      )}
    </div>
  );
};
