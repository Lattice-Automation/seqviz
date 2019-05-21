/**
 * NEB Restriction Enzymes
 *
 * a list of enzyme objects with their name as the key,
 * their recognition site sequence as "recognitionSeq", and cut site relative to the
 * start of the recognition site as "sequenceCutIdx", and the start of the resulting overhang
 * from the recognition site as "complementCutIdx"
 *
 * eg: PstI with recognition site "CTGCAG" cuts so that the break is
 * at (cutSite = 5):
 * 		..C TGCA|G..
 * 		..G|ACGT C..
 *
 * and the resulting fragment looks like (complementCutIdx = 1):
 * 		..CTGCA
 * 		..G****
 *
 * @typedef {Object}  EnzymeInfo
 * @property {String}    recognitionSeq    the recognition sequence associated with the enzyme
 * @property {Number}    complementCutIdx  the index of the hangSite, relative to the recognitionSeq start
 * @property {Number}    sequenceCutIdx   the cut index of the enzyme relative to recognitionSeq start
 */
export default {
  "PI-SceI": {
    recognitionSeq: "ATCTATGTCGGGTGCGGAGAAAGAGGTAATGAAATGG",
    complementCutIdx: 11,
    sequenceCutIdx: 15
  },
  "PI-PspI": {
    recognitionSeq: "TGGCAAACAGCTATTATGGGTATTATGGGT",
    complementCutIdx: 13,
    sequenceCutIdx: 17
  },
  "I-CeuI": {
    recognitionSeq: "TAACTATAACGGTCCTAAGGTAGCGAA",
    complementCutIdx: 14,
    sequenceCutIdx: 18
  },
  "I-SceI": {
    recognitionSeq: "TAGGGATAACAGGGTAAT",
    complementCutIdx: 5,
    sequenceCutIdx: 9
  },
  AscI: {
    recognitionSeq: "GGCGCGCC",
    complementCutIdx: 6,
    sequenceCutIdx: 2
  },
  AsiSI: {
    recognitionSeq: "GCGATCGC",
    complementCutIdx: 3,
    sequenceCutIdx: 5
  },
  FseI: {
    recognitionSeq: "GGCCGGCC",
    complementCutIdx: 2,
    sequenceCutIdx: 6
  },
  NotI: {
    recognitionSeq: "GCGGCCGC",
    complementCutIdx: 6,
    sequenceCutIdx: 2
  },
  PacI: {
    recognitionSeq: "TTAATTAA",
    complementCutIdx: 3,
    sequenceCutIdx: 5
  },
  PmeI: {
    recognitionSeq: "GTTTAAAC",
    complementCutIdx: 4,
    sequenceCutIdx: 4
  },
  PspXI: {
    recognitionSeq: "VCTCGAGB",
    complementCutIdx: 6,
    sequenceCutIdx: 2
  },
  SbfI: {
    recognitionSeq: "CCTGCAGG",
    complementCutIdx: 2,
    sequenceCutIdx: 6
  },
  SfiI: {
    recognitionSeq: "GGCCNNNNNGGCC",
    complementCutIdx: 5,
    sequenceCutIdx: 8
  },
  SgrAI: {
    recognitionSeq: "CRCCGGYG",
    complementCutIdx: 6,
    sequenceCutIdx: 2
  },
  SrfI: {
    recognitionSeq: "GCCCGGGC",
    complementCutIdx: 4,
    sequenceCutIdx: 4
  },
  SwaI: {
    recognitionSeq: "ATTTAAAT",
    complementCutIdx: 4,
    sequenceCutIdx: 4
  },
  BaeI: {
    recognitionSeq: "NNNNNNNNNNNNNNNACNNNNGTAYCNNNNNNNNNNNN",
    complementCutIdx: 33,
    sequenceCutIdx: 38
  },
  BbvCI: {
    recognitionSeq: "CCTCAGC",
    complementCutIdx: 5,
    sequenceCutIdx: 2
  },
  BspQI: {
    recognitionSeq: "GCTCTTCNNNN",
    complementCutIdx: 11,
    sequenceCutIdx: 8
  },
  CspCI: {
    recognitionSeq: "NNNNNNNNNNNNNCAANNNNNGTGGNNNNNNNNNNNN",
    complementCutIdx: 35,
    sequenceCutIdx: 37
  },
  PpuMI: {
    recognitionSeq: "RGGWCCY",
    complementCutIdx: 5,
    sequenceCutIdx: 2
  },
  RsrII: {
    recognitionSeq: "CGGWCCG",
    complementCutIdx: 5,
    sequenceCutIdx: 2
  },
  SapI: {
    recognitionSeq: "GCTCTTCNNNN",
    complementCutIdx: 11,
    sequenceCutIdx: 8
  },
  SexAI: {
    recognitionSeq: "ACCWGGT",
    complementCutIdx: 6,
    sequenceCutIdx: 1
  },
  AatII: {
    recognitionSeq: "GACGTC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  Acc65I: {
    recognitionSeq: "GGTACC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  AccI: {
    recognitionSeq: "GTMKAC",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  AclI: {
    recognitionSeq: "AACGTT",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  AcuI: {
    recognitionSeq: "CTGAAGNNNNNNNNNNNNNNNN",
    complementCutIdx: 20,
    sequenceCutIdx: 22
  },
  AfeI: {
    recognitionSeq: "AGCGCT",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  AflII: {
    recognitionSeq: "CTTAAG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  AflIII: {
    recognitionSeq: "ACRYGT",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  AgeI: {
    recognitionSeq: "ACCGGT",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  AhdI: {
    recognitionSeq: "GACNNNNNGTC",
    complementCutIdx: 5,
    sequenceCutIdx: 6
  },
  AleI: {
    recognitionSeq: "CACNNNNGTG",
    complementCutIdx: 5,
    sequenceCutIdx: 5
  },
  AlwNI: {
    recognitionSeq: "CAGNNNCTG",
    complementCutIdx: 3,
    sequenceCutIdx: 6
  },
  ApaI: {
    recognitionSeq: "GGGCCC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  ApaLI: {
    recognitionSeq: "GTGCAC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  ApoI: {
    recognitionSeq: "RAATTY",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  AseI: {
    recognitionSeq: "ATTAAT",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  AvaI: {
    recognitionSeq: "CYCGRG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  AvrII: {
    recognitionSeq: "CCTAGG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BaeGI: {
    recognitionSeq: "GKGCMC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  BamHI: {
    recognitionSeq: "GGATCC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BanI: {
    recognitionSeq: "GGYRCC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BanII: {
    recognitionSeq: "GRGCYC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  BbsI: {
    recognitionSeq: "GAAGACNNNNNN",
    complementCutIdx: 12,
    sequenceCutIdx: 8
  },
  BcgI: {
    recognitionSeq: "NNNNNNNNNNNNCGANNNNNNTGCNNNNNNNNNNNN",
    complementCutIdx: 34,
    sequenceCutIdx: 36
  },
  BciVI: {
    recognitionSeq: "GTATCCNNNNNN",
    complementCutIdx: 11,
    sequenceCutIdx: 12
  },
  BclI: {
    recognitionSeq: "TGATCA",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BfuAI: {
    recognitionSeq: "ACCTGCNNNNNNNN",
    complementCutIdx: 14,
    sequenceCutIdx: 10
  },
  BglI: {
    recognitionSeq: "GCCNNNNNGGC",
    complementCutIdx: 4,
    sequenceCutIdx: 7
  },
  BglII: {
    recognitionSeq: "AGATCT",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BlpI: {
    recognitionSeq: "GCTNAGC",
    complementCutIdx: 5,
    sequenceCutIdx: 2
  },
  BmgBI: {
    recognitionSeq: "CACGTC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  BmrI: {
    recognitionSeq: "ACTGGGNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 11
  },
  BmtI: {
    recognitionSeq: "GCTAGC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  BpmI: {
    recognitionSeq: "CTGGAGNNNNNNNNNNNNNNNN",
    complementCutIdx: 20,
    sequenceCutIdx: 22
  },
  Bpu10I: {
    recognitionSeq: "CCTNAGC",
    complementCutIdx: 5,
    sequenceCutIdx: 2
  },
  BpuEI: {
    recognitionSeq: "CTTGAGNNNNNNNNNNNNNNNN",
    complementCutIdx: 20,
    sequenceCutIdx: 22
  },
  BsaAI: {
    recognitionSeq: "YACGTR",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  BsaBI: {
    recognitionSeq: "GATNNNNATC",
    complementCutIdx: 5,
    sequenceCutIdx: 5
  },
  BsaHI: {
    recognitionSeq: "GRCGYC",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  BsaI: {
    recognitionSeq: "GGTCTCNNNNN",
    complementCutIdx: 11,
    sequenceCutIdx: 7
  },
  BsaWI: {
    recognitionSeq: "WCCGGW",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BsaXI: {
    recognitionSeq: "NNNNNNNNNNNNACNNNNNCTCCNNNNNNNNNN",
    complementCutIdx: 30,
    sequenceCutIdx: 33
  },
  BseRI: {
    recognitionSeq: "GAGGAGNNNNNNNNNN",
    complementCutIdx: 14,
    sequenceCutIdx: 16
  },
  BseYI: {
    recognitionSeq: "CCCAGC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BsgI: {
    recognitionSeq: "GTGCAGNNNNNNNNNNNNNNNN",
    complementCutIdx: 20,
    sequenceCutIdx: 22
  },
  BsiEI: {
    recognitionSeq: "CGRYCG",
    complementCutIdx: 2,
    sequenceCutIdx: 4
  },
  BsiHKAI: {
    recognitionSeq: "GWGCWC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  BsiWI: {
    recognitionSeq: "CGTACG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BsmBI: {
    recognitionSeq: "CGTCTCNNNNN",
    complementCutIdx: 11,
    sequenceCutIdx: 7
  },
  BsmI: {
    recognitionSeq: "GAATGCN",
    complementCutIdx: 5,
    sequenceCutIdx: 7
  },
  BsoBI: {
    recognitionSeq: "CYCGRG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  Bsp1286I: {
    recognitionSeq: "GDGCHC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  BspDI: {
    recognitionSeq: "ATCGAT",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  BspEI: {
    recognitionSeq: "TCCGGA",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BspHI: {
    recognitionSeq: "TCATGA",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BspMI: {
    recognitionSeq: "ACCTGCNNNNNNNN",
    complementCutIdx: 14,
    sequenceCutIdx: 10
  },
  BsrBI: {
    recognitionSeq: "CCGCTC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  BsrDI: {
    recognitionSeq: "GCAATGNN",
    complementCutIdx: 6,
    sequenceCutIdx: 8
  },
  BsrFI: {
    recognitionSeq: "RCCGGY",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BsrGI: {
    recognitionSeq: "TGTACA",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BssHII: {
    recognitionSeq: "GCGCGC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BssSI: {
    recognitionSeq: "CACGAG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BstAPI: {
    recognitionSeq: "GCANNNNNTGC",
    complementCutIdx: 4,
    sequenceCutIdx: 7
  },
  BstBI: {
    recognitionSeq: "TTCGAA",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  BstEII: {
    recognitionSeq: "GGTNACC",
    complementCutIdx: 6,
    sequenceCutIdx: 1
  },
  BstXI: {
    recognitionSeq: "CCANNNNNNTGG",
    complementCutIdx: 4,
    sequenceCutIdx: 8
  },
  BstYI: {
    recognitionSeq: "RGATCY",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BstZ17I: {
    recognitionSeq: "GTATAC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  Bsu36I: {
    recognitionSeq: "CCTNAGG",
    complementCutIdx: 5,
    sequenceCutIdx: 2
  },
  BtgI: {
    recognitionSeq: "CCRYGG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BtgZI: {
    recognitionSeq: "GCGATGNNNNNNNNNNNNNN",
    complementCutIdx: 20,
    sequenceCutIdx: 16
  },
  BtsI: {
    recognitionSeq: "GCAGTGNN",
    complementCutIdx: 6,
    sequenceCutIdx: 8
  },
  ClaI: {
    recognitionSeq: "ATCGAT",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  DraI: {
    recognitionSeq: "TTTAAA",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  DraIII: {
    recognitionSeq: "CACNNNGTG",
    complementCutIdx: 3,
    sequenceCutIdx: 6
  },
  DrdI: {
    recognitionSeq: "GACNNNNNNGTC",
    complementCutIdx: 5,
    sequenceCutIdx: 7
  },
  EaeI: {
    recognitionSeq: "YGGCCR",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  EagI: {
    recognitionSeq: "CGGCCG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  EarI: {
    recognitionSeq: "CTCTTCNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 7
  },
  EciI: {
    recognitionSeq: "GGCGGANNNNNNNNNNN",
    complementCutIdx: 15,
    sequenceCutIdx: 17
  },
  Eco53kI: {
    recognitionSeq: "GAGCTC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  EcoNI: {
    recognitionSeq: "CCTNNNNNAGG",
    complementCutIdx: 6,
    sequenceCutIdx: 5
  },
  EcoO109I: {
    recognitionSeq: "RGGNCCY",
    complementCutIdx: 5,
    sequenceCutIdx: 2
  },
  EcoRI: {
    recognitionSeq: "GAATTC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  EcoRV: {
    recognitionSeq: "GATATC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  Esp3I: {
    recognitionSeq: "CGTCTCNNNNN",
    complementCutIdx: 11,
    sequenceCutIdx: 7
  },
  FspI: {
    recognitionSeq: "TGCGCA",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  HaeII: {
    recognitionSeq: "RGCGCY",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  HincII: {
    recognitionSeq: "GTYRAC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  HindIII: {
    recognitionSeq: "AAGCTT",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  HpaI: {
    recognitionSeq: "GTTAAC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  KasI: {
    recognitionSeq: "GGCGCC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  KpnI: {
    recognitionSeq: "GGTACC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  MfeI: {
    recognitionSeq: "CAATTG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  MluI: {
    recognitionSeq: "ACGCGT",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  MmeI: {
    recognitionSeq: "TCCRACNNNNNNNNNNNNNNNNNNNN",
    complementCutIdx: 24,
    sequenceCutIdx: 26
  },
  MscI: {
    recognitionSeq: "TGGCCA",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  MslI: {
    recognitionSeq: "CAYNNNNRTG",
    complementCutIdx: 5,
    sequenceCutIdx: 5
  },
  MspA1I: {
    recognitionSeq: "CMGCKG",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  NaeI: {
    recognitionSeq: "GCCGGC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  NarI: {
    recognitionSeq: "GGCGCC",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  NcoI: {
    recognitionSeq: "CCATGG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  NdeI: {
    recognitionSeq: "CATATG",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  NgoMIV: {
    recognitionSeq: "GCCGGC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  NheI: {
    recognitionSeq: "GCTAGC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  NmeAIII: {
    recognitionSeq: "GCCGAGNNNNNNNNNNNNNNNNNNNN",
    complementCutIdx: 25,
    sequenceCutIdx: 26
  },
  NruI: {
    recognitionSeq: "TCGCGA",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  NsiI: {
    recognitionSeq: "ATGCAT",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  NspI: {
    recognitionSeq: "RCATGY",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  PaeR7I: {
    recognitionSeq: "CTCGAG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  PciI: {
    recognitionSeq: "ACATGT",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  PflFI: {
    recognitionSeq: "GACNNNGTC",
    complementCutIdx: 5,
    sequenceCutIdx: 4
  },
  PflMI: {
    recognitionSeq: "CCANNNNNTGG",
    complementCutIdx: 4,
    sequenceCutIdx: 7
  },
  PluTI: {
    recognitionSeq: "GGCGCC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  PmlI: {
    recognitionSeq: "CACGTG",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  PshAI: {
    recognitionSeq: "GACNNNNGTC",
    complementCutIdx: 5,
    sequenceCutIdx: 5
  },
  PsiI: {
    recognitionSeq: "TTATAA",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  PspOMI: {
    recognitionSeq: "GGGCCC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  PstI: {
    recognitionSeq: "CTGCAG",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  PvuI: {
    recognitionSeq: "CGATCG",
    complementCutIdx: 2,
    sequenceCutIdx: 4
  },
  PvuII: {
    recognitionSeq: "CAGCTG",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  SacI: {
    recognitionSeq: "GAGCTC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  SacII: {
    recognitionSeq: "CCGCGG",
    complementCutIdx: 2,
    sequenceCutIdx: 4
  },
  SalI: {
    recognitionSeq: "GTCGAC",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  ScaI: {
    recognitionSeq: "AGTACT",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  SfcI: {
    recognitionSeq: "CTRYAG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  SfoI: {
    recognitionSeq: "GGCGCC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  SmaI: {
    recognitionSeq: "CCCGGG",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  SmlI: {
    recognitionSeq: "CTYRAG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  SnaBI: {
    recognitionSeq: "TACGTA",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  SpeI: {
    recognitionSeq: "ACTAGT",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  SphI: {
    recognitionSeq: "GCATGC",
    complementCutIdx: 1,
    sequenceCutIdx: 5
  },
  SspI: {
    recognitionSeq: "AATATT",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  StuI: {
    recognitionSeq: "AGGCCT",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  StyI: {
    recognitionSeq: "CCWWGG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  TspMI: {
    recognitionSeq: "CCCGGG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  Tth111I: {
    recognitionSeq: "GACNNNGTC",
    complementCutIdx: 5,
    sequenceCutIdx: 4
  },
  XbaI: {
    recognitionSeq: "TCTAGA",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  XcmI: {
    recognitionSeq: "CCANNNNNNNNNTGG",
    complementCutIdx: 7,
    sequenceCutIdx: 8
  },
  XhoI: {
    recognitionSeq: "CTCGAG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  XmaI: {
    recognitionSeq: "CCCGGG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  XmnI: {
    recognitionSeq: "GAANNNNTTC",
    complementCutIdx: 5,
    sequenceCutIdx: 5
  },
  ZraI: {
    recognitionSeq: "GACGTC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  AlwI: {
    recognitionSeq: "GGATCNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 9
  },
  ApeKI: {
    recognitionSeq: "GCWGC",
    complementCutIdx: 4,
    sequenceCutIdx: 1
  },
  AvaII: {
    recognitionSeq: "GGWCC",
    complementCutIdx: 4,
    sequenceCutIdx: 1
  },
  BbvI: {
    recognitionSeq: "GCAGCNNNNNNNNNNNN",
    complementCutIdx: 17,
    sequenceCutIdx: 13
  },
  BccI: {
    recognitionSeq: "CCATCNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 9
  },
  BceAI: {
    recognitionSeq: "ACGGCNNNNNNNNNNNNNN",
    complementCutIdx: 19,
    sequenceCutIdx: 17
  },
  BcoDI: {
    recognitionSeq: "GTCTCNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 6
  },
  BsmAI: {
    recognitionSeq: "GTCTCNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 6
  },
  BsmFI: {
    recognitionSeq: "GGGACNNNNNNNNNNNNNN",
    complementCutIdx: 19,
    sequenceCutIdx: 15
  },
  BspCNI: {
    recognitionSeq: "CTCAGNNNNNNNNN",
    complementCutIdx: 12,
    sequenceCutIdx: 14
  },
  BsrI: {
    recognitionSeq: "ACTGGN",
    complementCutIdx: 4,
    sequenceCutIdx: 6
  },
  BstNI: {
    recognitionSeq: "CCWGG",
    complementCutIdx: 3,
    sequenceCutIdx: 2
  },
  BtsCI: {
    recognitionSeq: "GGATGNN",
    complementCutIdx: 5,
    sequenceCutIdx: 7
  },
  BtsIMutI: {
    recognitionSeq: "CAGTGNN",
    complementCutIdx: 5,
    sequenceCutIdx: 7
  },
  DpnI: {
    recognitionSeq: "GmATC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  FauI: {
    recognitionSeq: "CCCGCNNNNNN",
    complementCutIdx: 11,
    sequenceCutIdx: 9
  },
  FokI: {
    recognitionSeq: "GGATGNNNNNNNNNNNNN",
    complementCutIdx: 18,
    sequenceCutIdx: 14
  },
  HgaI: {
    recognitionSeq: "GACGCNNNNNNNNNN",
    complementCutIdx: 15,
    sequenceCutIdx: 10
  },
  HphI: {
    recognitionSeq: "GGTGANNNNNNNN",
    complementCutIdx: 12,
    sequenceCutIdx: 13
  },
  Hpy99I: {
    recognitionSeq: "CGWCG",
    complementCutIdx: 0,
    sequenceCutIdx: 5
  },
  HpyAV: {
    recognitionSeq: "CCTTCNNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 11
  },
  LpnPI: {
    recognitionSeq: "CmCDGNNNNNNNNNNNNNN",
    complementCutIdx: 19,
    sequenceCutIdx: 15
  },
  MboII: {
    recognitionSeq: "GAAGANNNNNNNN",
    complementCutIdx: 12,
    sequenceCutIdx: 13
  },
  MlyI: {
    recognitionSeq: "GAGTCNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 10
  },
  NciI: {
    recognitionSeq: "CCSGG",
    complementCutIdx: 3,
    sequenceCutIdx: 2
  },
  PleI: {
    recognitionSeq: "GAGTCNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 9
  },
  PspGI: {
    recognitionSeq: "CCWGG",
    complementCutIdx: 5,
    sequenceCutIdx: 0
  },
  SfaNI: {
    recognitionSeq: "GCATCNNNNNNNNN",
    complementCutIdx: 14,
    sequenceCutIdx: 10
  },
  TfiI: {
    recognitionSeq: "GAWTC",
    complementCutIdx: 4,
    sequenceCutIdx: 1
  },
  TseI: {
    recognitionSeq: "GCWGC",
    complementCutIdx: 4,
    sequenceCutIdx: 1
  },
  Tsp45I: {
    recognitionSeq: "GTSAC",
    complementCutIdx: 5,
    sequenceCutIdx: 0
  },
  TspRI: {
    recognitionSeq: "NNCASTGNN",
    complementCutIdx: 0,
    sequenceCutIdx: 9
  },
  AciI: {
    recognitionSeq: "CCGC",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  AluI: {
    recognitionSeq: "AGCT",
    complementCutIdx: 2,
    sequenceCutIdx: 2
  },
  BfaI: {
    recognitionSeq: "CTAG",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  BsaJI: {
    recognitionSeq: "CCNNGG",
    complementCutIdx: 5,
    sequenceCutIdx: 1
  },
  BslI: {
    recognitionSeq: "CCNNNNNNNGG",
    complementCutIdx: 4,
    sequenceCutIdx: 7
  },
  BstUI: {
    recognitionSeq: "CGCG",
    complementCutIdx: 2,
    sequenceCutIdx: 2
  },
  Cac8I: {
    recognitionSeq: "GCNNGC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  CviAII: {
    recognitionSeq: "CATG",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  "CviKI-1": {
    recognitionSeq: "RGCY",
    complementCutIdx: 2,
    sequenceCutIdx: 2
  },
  CviQI: {
    recognitionSeq: "GTAC",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  DdeI: {
    recognitionSeq: "CTNAG",
    complementCutIdx: 4,
    sequenceCutIdx: 1
  },
  DpnII: {
    recognitionSeq: "GATC",
    complementCutIdx: 4,
    sequenceCutIdx: 0
  },
  FatI: {
    recognitionSeq: "CATG",
    complementCutIdx: 4,
    sequenceCutIdx: 0
  },
  Fnu4HI: {
    recognitionSeq: "GCNGC",
    complementCutIdx: 3,
    sequenceCutIdx: 2
  },
  HaeIII: {
    recognitionSeq: "GGCC",
    complementCutIdx: 2,
    sequenceCutIdx: 2
  },
  HhaI: {
    recognitionSeq: "GCGC",
    complementCutIdx: 1,
    sequenceCutIdx: 3
  },
  HinP1I: {
    recognitionSeq: "GCGC",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  HinfI: {
    recognitionSeq: "GANTC",
    complementCutIdx: 4,
    sequenceCutIdx: 1
  },
  HpaII: {
    recognitionSeq: "CCGG",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  Hpy166II: {
    recognitionSeq: "GTNNAC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  Hpy188I: {
    recognitionSeq: "TCNGA",
    complementCutIdx: 2,
    sequenceCutIdx: 3
  },
  Hpy188III: {
    recognitionSeq: "TCNNGA",
    complementCutIdx: 4,
    sequenceCutIdx: 2
  },
  HpyCH4III: {
    recognitionSeq: "ACNGT",
    complementCutIdx: 2,
    sequenceCutIdx: 3
  },
  HpyCH4IV: {
    recognitionSeq: "ACGT",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  HpyCH4V: {
    recognitionSeq: "TGCA",
    complementCutIdx: 2,
    sequenceCutIdx: 2
  },
  MboI: {
    recognitionSeq: "GATC",
    complementCutIdx: 4,
    sequenceCutIdx: 0
  },
  MluCI: {
    recognitionSeq: "AATT",
    complementCutIdx: 4,
    sequenceCutIdx: 0
  },
  MnlI: {
    recognitionSeq: "CCTCNNNNNNN",
    complementCutIdx: 10,
    sequenceCutIdx: 11
  },
  MseI: {
    recognitionSeq: "TTAA",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  MspI: {
    recognitionSeq: "CCGG",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  MwoI: {
    recognitionSeq: "GCNNNNNNNGC",
    complementCutIdx: 4,
    sequenceCutIdx: 7
  },
  NlaIII: {
    recognitionSeq: "CATG",
    complementCutIdx: 0,
    sequenceCutIdx: 4
  },
  NlaIV: {
    recognitionSeq: "GGNNCC",
    complementCutIdx: 3,
    sequenceCutIdx: 3
  },
  RsaI: {
    recognitionSeq: "GTAC",
    complementCutIdx: 2,
    sequenceCutIdx: 2
  },
  Sau3AI: {
    recognitionSeq: "GATC",
    complementCutIdx: 4,
    sequenceCutIdx: 0
  },
  Sau96I: {
    recognitionSeq: "GGNCC",
    complementCutIdx: 4,
    sequenceCutIdx: 1
  },
  ScrFI: {
    recognitionSeq: "CCNGG",
    complementCutIdx: 3,
    sequenceCutIdx: 2
  },
  StyD4I: {
    recognitionSeq: "CCNGG",
    complementCutIdx: 5,
    sequenceCutIdx: 0
  },
  TaqI: {
    recognitionSeq: "TCGA",
    complementCutIdx: 3,
    sequenceCutIdx: 1
  },
  AbaSI: {
    recognitionSeq: "hmCNNNNNNNNNNN",
    complementCutIdx: 12,
    sequenceCutIdx: 14
  },
  FspEI: {
    recognitionSeq: "CmCNNNNNNNNNNNNNNNN",
    complementCutIdx: 19,
    sequenceCutIdx: 15
  },
  MspJI: {
    recognitionSeq: "mCNNRNNNNNNNNNNNNN",
    complementCutIdx: 18,
    sequenceCutIdx: 14
  }
};
