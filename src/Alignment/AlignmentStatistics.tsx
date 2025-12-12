import * as React from "react";

export default function AlignmentStatistics({ name, nameToCompare, seq, seqToCompare, seqType }) {
  const generateFunctionSymbol = () => {
    const blossom_block = [
      ['c'],
      ['s', 't', 'a', 'g', 'p'],
      ['d', 'e', 'q', 'n'],
      ['k', 'r', 'h'],
      ['m', 'i', 'l', 'v'],
      ['f', 'y', 'w']
    ];
    let seqSymbols = '';

    if (seqType === 'aa') {
      seqToCompare.split('').forEach((c, i) => seqSymbols += (blossom_block.find(block => block.includes(c.toLowerCase())) || []).includes(seq[i].toLowerCase()) ? (seq[i] === c) ? '|' : '.' : (seq[i] === '-' || c === '-') ? '-' : '*');
    } else {
      seqToCompare.split('').forEach((c, i) => seqSymbols += [c, seq[i]].includes('-') ? ' ' : c === seq[i] ? '|' : '.');
    }
    return `${seqSymbols}`
  }
  return (
    <>
      <table style={{ border: '1px solid RGB(235 235 235)', margin: '20px', borderCollapse: 'collapse'}}>
        <tr className="alignment-table-row"><th 
        className="alignment-table-col"></th><th 
        className="alignment-table-col">Length</th><th
        className="alignment-table-col">Fraction Identical</th>
        <th className="alignment-table-col">Coverage</th>
        </tr>
        <tr className="alignment-table-row"><th 
        className="alignment-table-col">{ name }</th><td
        className="alignment-table-col">{seq.split("").filter(el => el !== '-').length}</td><td
        className="alignment-table-col">{(generateFunctionSymbol().split('').reduce((a, c) => { if (c === '|') return a += 1; return a }, 0) / seq.split("").filter(el => el !== '-').length).toFixed(2)}</td><td
        className="alignment-table-col">{(generateFunctionSymbol().split('').reduce((a, c) => { if (['|', '.'].includes(c)) return a += 1; return a }, 0) / seq.split("").filter(el => el !== '-').length).toFixed(2)}</td></tr>
        <tr className="alignment-table-row"><th 
        className="alignment-table-col">{nameToCompare}</th><td
        className="alignment-table-col">{seqToCompare.split("").filter(el => el !== '-').length}</td><td
        className="alignment-table-col">{(generateFunctionSymbol().split('').reduce((a, c) => { if (c === '|') return a += 1; return a }, 0) / seqToCompare.split("").filter(el => el !== '-').length).toFixed(2)}</td><td
        className="alignment-table-col">{(generateFunctionSymbol().split('').reduce((a, c) => { if (['|', '.'].includes(c)) return a += 1; return a }, 0) / seqToCompare.split("").filter(el => el !== '-').length).toFixed(2)}</td></tr>
      </table>
      <div style={{ margin: '20px', fontFamily: 'sans-serif' }}><b>Number of mismatches</b>: {generateFunctionSymbol().split('').reduce((a, c) => { if ([' ', '.'].includes(c)) return a += 1; return a }, 0)} </div>
</>
  )
}
