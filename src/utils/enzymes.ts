/**
 * NEB Restriction Enzymes
 *
 * a list of enzyme objects with their name as the key,
 * their recognition site sequence as "rseq", and cut site relative to the
 * start of the recognition site as "fcut", and the start of the resulting overhang
 * from the recognition site as "rcut"
 *
 * eg: PstI with recognition site "CTGCAG" cuts so that the break is
 * at (cutSite = 5):
 * 		..C TGCA|G..
 * 		..G|ACGT C..
 *
 * and the resulting fragment looks like (rcut = 1):
 * 		..CTGCA
 * 		..G****
 *
 */
export default {
  "PI-SceI": {
    rseq: "ATCTATGTCGGGTGCGGAGAAAGAGGTAATGAAATGG",
    rcut: 11,
    fcut: 15,
  },
  "PI-PspI": {
    rseq: "TGGCAAACAGCTATTATGGGTATTATGGGT",
    rcut: 13,
    fcut: 17,
  },
  "I-CeuI": {
    rseq: "TAACTATAACGGTCCTAAGGTAGCGAA",
    rcut: 14,
    fcut: 18,
  },
  "I-SceI": {
    rseq: "TAGGGATAACAGGGTAAT",
    rcut: 5,
    fcut: 9,
  },
  AscI: {
    rseq: "GGCGCGCC",
    rcut: 6,
    fcut: 2,
  },
  AsiSI: {
    rseq: "GCGATCGC",
    rcut: 3,
    fcut: 5,
  },
  FseI: {
    rseq: "GGCCGGCC",
    rcut: 2,
    fcut: 6,
  },
  NotI: {
    rseq: "GCGGCCGC",
    rcut: 6,
    fcut: 2,
  },
  PacI: {
    rseq: "TTAATTAA",
    rcut: 3,
    fcut: 5,
  },
  PmeI: {
    rseq: "GTTTAAAC",
    rcut: 4,
    fcut: 4,
  },
  PspXI: {
    rseq: "VCTCGAGB",
    rcut: 6,
    fcut: 2,
  },
  SbfI: {
    rseq: "CCTGCAGG",
    rcut: 2,
    fcut: 6,
  },
  SfiI: {
    rseq: "GGCCNNNNNGGCC",
    rcut: 5,
    fcut: 8,
  },
  SgrAI: {
    rseq: "CRCCGGYG",
    rcut: 6,
    fcut: 2,
  },
  SrfI: {
    rseq: "GCCCGGGC",
    rcut: 4,
    fcut: 4,
  },
  SwaI: {
    rseq: "ATTTAAAT",
    rcut: 4,
    fcut: 4,
  },
  BaeI: {
    rseq: "NNNNNNNNNNNNNNNACNNNNGTAYCNNNNNNNNNNNN",
    rcut: 33,
    fcut: 38,
  },
  BbvCI: {
    rseq: "CCTCAGC",
    rcut: 5,
    fcut: 2,
  },
  BspQI: {
    rseq: "GCTCTTCNNNN",
    rcut: 11,
    fcut: 8,
  },
  CspCI: {
    rseq: "NNNNNNNNNNNNNCAANNNNNGTGGNNNNNNNNNNNN",
    rcut: 35,
    fcut: 37,
  },
  PpuMI: {
    rseq: "RGGWCCY",
    rcut: 5,
    fcut: 2,
  },
  RsrII: {
    rseq: "CGGWCCG",
    rcut: 5,
    fcut: 2,
  },
  SapI: {
    rseq: "GCTCTTCNNNN",
    rcut: 11,
    fcut: 8,
  },
  SexAI: {
    rseq: "ACCWGGT",
    rcut: 6,
    fcut: 1,
  },
  AatII: {
    rseq: "GACGTC",
    rcut: 1,
    fcut: 5,
  },
  Acc65I: {
    rseq: "GGTACC",
    rcut: 5,
    fcut: 1,
  },
  AccI: {
    rseq: "GTMKAC",
    rcut: 4,
    fcut: 2,
  },
  AclI: {
    rseq: "AACGTT",
    rcut: 4,
    fcut: 2,
  },
  AcuI: {
    rseq: "CTGAAGNNNNNNNNNNNNNNNN",
    rcut: 20,
    fcut: 22,
  },
  AfeI: {
    rseq: "AGCGCT",
    rcut: 3,
    fcut: 3,
  },
  AflII: {
    rseq: "CTTAAG",
    rcut: 5,
    fcut: 1,
  },
  AflIII: {
    rseq: "ACRYGT",
    rcut: 5,
    fcut: 1,
  },
  AgeI: {
    rseq: "ACCGGT",
    rcut: 5,
    fcut: 1,
  },
  AhdI: {
    rseq: "GACNNNNNGTC",
    rcut: 5,
    fcut: 6,
  },
  AleI: {
    rseq: "CACNNNNGTG",
    rcut: 5,
    fcut: 5,
  },
  AlwNI: {
    rseq: "CAGNNNCTG",
    rcut: 3,
    fcut: 6,
  },
  ApaI: {
    rseq: "GGGCCC",
    rcut: 1,
    fcut: 5,
  },
  ApaLI: {
    rseq: "GTGCAC",
    rcut: 5,
    fcut: 1,
  },
  ApoI: {
    rseq: "RAATTY",
    rcut: 5,
    fcut: 1,
  },
  AseI: {
    rseq: "ATTAAT",
    rcut: 4,
    fcut: 2,
  },
  AvaI: {
    rseq: "CYCGRG",
    rcut: 5,
    fcut: 1,
  },
  AvrII: {
    rseq: "CCTAGG",
    rcut: 5,
    fcut: 1,
  },
  BaeGI: {
    rseq: "GKGCMC",
    rcut: 1,
    fcut: 5,
  },
  BamHI: {
    rseq: "GGATCC",
    rcut: 5,
    fcut: 1,
  },
  BanI: {
    rseq: "GGYRCC",
    rcut: 5,
    fcut: 1,
  },
  BanII: {
    rseq: "GRGCYC",
    rcut: 1,
    fcut: 5,
  },
  BbsI: {
    rseq: "GAAGACNNNNNN",
    rcut: 12,
    fcut: 8,
  },
  BcgI: {
    rseq: "NNNNNNNNNNNNCGANNNNNNTGCNNNNNNNNNNNN",
    rcut: 34,
    fcut: 36,
  },
  BciVI: {
    rseq: "GTATCCNNNNNN",
    rcut: 11,
    fcut: 12,
  },
  BclI: {
    rseq: "TGATCA",
    rcut: 5,
    fcut: 1,
  },
  BfuAI: {
    rseq: "ACCTGCNNNNNNNN",
    rcut: 14,
    fcut: 10,
  },
  BglI: {
    rseq: "GCCNNNNNGGC",
    rcut: 4,
    fcut: 7,
  },
  BglII: {
    rseq: "AGATCT",
    rcut: 5,
    fcut: 1,
  },
  BlpI: {
    rseq: "GCTNAGC",
    rcut: 5,
    fcut: 2,
  },
  BmgBI: {
    rseq: "CACGTC",
    rcut: 3,
    fcut: 3,
  },
  BmrI: {
    rseq: "ACTGGGNNNNN",
    rcut: 10,
    fcut: 11,
  },
  BmtI: {
    rseq: "GCTAGC",
    rcut: 1,
    fcut: 5,
  },
  BpmI: {
    rseq: "CTGGAGNNNNNNNNNNNNNNNN",
    rcut: 20,
    fcut: 22,
  },
  Bpu10I: {
    rseq: "CCTNAGC",
    rcut: 5,
    fcut: 2,
  },
  BpuEI: {
    rseq: "CTTGAGNNNNNNNNNNNNNNNN",
    rcut: 20,
    fcut: 22,
  },
  BsaAI: {
    rseq: "YACGTR",
    rcut: 3,
    fcut: 3,
  },
  BsaBI: {
    rseq: "GATNNNNATC",
    rcut: 5,
    fcut: 5,
  },
  BsaHI: {
    rseq: "GRCGYC",
    rcut: 4,
    fcut: 2,
  },
  BsaI: {
    rseq: "GGTCTCNNNNN",
    rcut: 11,
    fcut: 7,
  },
  BsaWI: {
    rseq: "WCCGGW",
    rcut: 5,
    fcut: 1,
  },
  BsaXI: {
    rseq: "NNNNNNNNNNNNACNNNNNCTCCNNNNNNNNNN",
    rcut: 30,
    fcut: 33,
  },
  BseRI: {
    rseq: "GAGGAGNNNNNNNNNN",
    rcut: 14,
    fcut: 16,
  },
  BseYI: {
    rseq: "CCCAGC",
    rcut: 5,
    fcut: 1,
  },
  BsgI: {
    rseq: "GTGCAGNNNNNNNNNNNNNNNN",
    rcut: 20,
    fcut: 22,
  },
  BsiEI: {
    rseq: "CGRYCG",
    rcut: 2,
    fcut: 4,
  },
  BsiHKAI: {
    rseq: "GWGCWC",
    rcut: 1,
    fcut: 5,
  },
  BsiWI: {
    rseq: "CGTACG",
    rcut: 5,
    fcut: 1,
  },
  BsmBI: {
    rseq: "CGTCTCNNNNN",
    rcut: 11,
    fcut: 7,
  },
  BsmI: {
    rseq: "GAATGCN",
    rcut: 5,
    fcut: 7,
  },
  BsoBI: {
    rseq: "CYCGRG",
    rcut: 5,
    fcut: 1,
  },
  Bsp1286I: {
    rseq: "GDGCHC",
    rcut: 1,
    fcut: 5,
  },
  BspDI: {
    rseq: "ATCGAT",
    rcut: 4,
    fcut: 2,
  },
  BspEI: {
    rseq: "TCCGGA",
    rcut: 5,
    fcut: 1,
  },
  BspHI: {
    rseq: "TCATGA",
    rcut: 5,
    fcut: 1,
  },
  BspMI: {
    rseq: "ACCTGCNNNNNNNN",
    rcut: 14,
    fcut: 10,
  },
  BsrBI: {
    rseq: "CCGCTC",
    rcut: 3,
    fcut: 3,
  },
  BsrDI: {
    rseq: "GCAATGNN",
    rcut: 6,
    fcut: 8,
  },
  BsrFI: {
    rseq: "RCCGGY",
    rcut: 5,
    fcut: 1,
  },
  BsrGI: {
    rseq: "TGTACA",
    rcut: 5,
    fcut: 1,
  },
  BssHII: {
    rseq: "GCGCGC",
    rcut: 5,
    fcut: 1,
  },
  BssSI: {
    rseq: "CACGAG",
    rcut: 5,
    fcut: 1,
  },
  BstAPI: {
    rseq: "GCANNNNNTGC",
    rcut: 4,
    fcut: 7,
  },
  BstBI: {
    rseq: "TTCGAA",
    rcut: 4,
    fcut: 2,
  },
  BstEII: {
    rseq: "GGTNACC",
    rcut: 6,
    fcut: 1,
  },
  BstXI: {
    rseq: "CCANNNNNNTGG",
    rcut: 4,
    fcut: 8,
  },
  BstYI: {
    rseq: "RGATCY",
    rcut: 5,
    fcut: 1,
  },
  BstZ17I: {
    rseq: "GTATAC",
    rcut: 3,
    fcut: 3,
  },
  Bsu36I: {
    rseq: "CCTNAGG",
    rcut: 5,
    fcut: 2,
  },
  BtgI: {
    rseq: "CCRYGG",
    rcut: 5,
    fcut: 1,
  },
  BtgZI: {
    rseq: "GCGATGNNNNNNNNNNNNNN",
    rcut: 20,
    fcut: 16,
  },
  BtsI: {
    rseq: "GCAGTGNN",
    rcut: 6,
    fcut: 8,
  },
  ClaI: {
    rseq: "ATCGAT",
    rcut: 4,
    fcut: 2,
  },
  DraI: {
    rseq: "TTTAAA",
    rcut: 3,
    fcut: 3,
  },
  DraIII: {
    rseq: "CACNNNGTG",
    rcut: 3,
    fcut: 6,
  },
  DrdI: {
    rseq: "GACNNNNNNGTC",
    rcut: 5,
    fcut: 7,
  },
  EaeI: {
    rseq: "YGGCCR",
    rcut: 5,
    fcut: 1,
  },
  EagI: {
    rseq: "CGGCCG",
    rcut: 5,
    fcut: 1,
  },
  EarI: {
    rseq: "CTCTTCNNNN",
    rcut: 10,
    fcut: 7,
  },
  EciI: {
    rseq: "GGCGGANNNNNNNNNNN",
    rcut: 15,
    fcut: 17,
  },
  Eco53kI: {
    rseq: "GAGCTC",
    rcut: 3,
    fcut: 3,
  },
  EcoNI: {
    rseq: "CCTNNNNNAGG",
    rcut: 6,
    fcut: 5,
  },
  EcoO109I: {
    rseq: "RGGNCCY",
    rcut: 5,
    fcut: 2,
  },
  EcoRI: {
    rseq: "GAATTC",
    rcut: 5,
    fcut: 1,
  },
  EcoRV: {
    rseq: "GATATC",
    rcut: 3,
    fcut: 3,
  },
  Esp3I: {
    rseq: "CGTCTCNNNNN",
    rcut: 11,
    fcut: 7,
  },
  FspI: {
    rseq: "TGCGCA",
    rcut: 3,
    fcut: 3,
  },
  HaeII: {
    rseq: "RGCGCY",
    rcut: 1,
    fcut: 5,
  },
  HincII: {
    rseq: "GTYRAC",
    rcut: 3,
    fcut: 3,
  },
  HindIII: {
    rseq: "AAGCTT",
    rcut: 5,
    fcut: 1,
  },
  HpaI: {
    rseq: "GTTAAC",
    rcut: 3,
    fcut: 3,
  },
  KasI: {
    rseq: "GGCGCC",
    rcut: 5,
    fcut: 1,
  },
  KpnI: {
    rseq: "GGTACC",
    rcut: 1,
    fcut: 5,
  },
  MfeI: {
    rseq: "CAATTG",
    rcut: 5,
    fcut: 1,
  },
  MluI: {
    rseq: "ACGCGT",
    rcut: 5,
    fcut: 1,
  },
  MmeI: {
    rseq: "TCCRACNNNNNNNNNNNNNNNNNNNN",
    rcut: 24,
    fcut: 26,
  },
  MscI: {
    rseq: "TGGCCA",
    rcut: 3,
    fcut: 3,
  },
  MslI: {
    rseq: "CAYNNNNRTG",
    rcut: 5,
    fcut: 5,
  },
  MspA1I: {
    rseq: "CMGCKG",
    rcut: 3,
    fcut: 3,
  },
  NaeI: {
    rseq: "GCCGGC",
    rcut: 3,
    fcut: 3,
  },
  NarI: {
    rseq: "GGCGCC",
    rcut: 4,
    fcut: 2,
  },
  NcoI: {
    rseq: "CCATGG",
    rcut: 5,
    fcut: 1,
  },
  NdeI: {
    rseq: "CATATG",
    rcut: 4,
    fcut: 2,
  },
  NgoMIV: {
    rseq: "GCCGGC",
    rcut: 5,
    fcut: 1,
  },
  NheI: {
    rseq: "GCTAGC",
    rcut: 5,
    fcut: 1,
  },
  NmeAIII: {
    rseq: "GCCGAGNNNNNNNNNNNNNNNNNNNN",
    rcut: 25,
    fcut: 26,
  },
  NruI: {
    rseq: "TCGCGA",
    rcut: 3,
    fcut: 3,
  },
  NsiI: {
    rseq: "ATGCAT",
    rcut: 1,
    fcut: 5,
  },
  NspI: {
    rseq: "RCATGY",
    rcut: 1,
    fcut: 5,
  },
  PaeR7I: {
    rseq: "CTCGAG",
    rcut: 5,
    fcut: 1,
  },
  PciI: {
    rseq: "ACATGT",
    rcut: 5,
    fcut: 1,
  },
  PflFI: {
    rseq: "GACNNNGTC",
    rcut: 5,
    fcut: 4,
  },
  PflMI: {
    rseq: "CCANNNNNTGG",
    rcut: 4,
    fcut: 7,
  },
  PluTI: {
    rseq: "GGCGCC",
    rcut: 1,
    fcut: 5,
  },
  PmlI: {
    rseq: "CACGTG",
    rcut: 3,
    fcut: 3,
  },
  PshAI: {
    rseq: "GACNNNNGTC",
    rcut: 5,
    fcut: 5,
  },
  PsiI: {
    rseq: "TTATAA",
    rcut: 3,
    fcut: 3,
  },
  PspOMI: {
    rseq: "GGGCCC",
    rcut: 5,
    fcut: 1,
  },
  PstI: {
    rseq: "CTGCAG",
    rcut: 1,
    fcut: 5,
  },
  PvuI: {
    rseq: "CGATCG",
    rcut: 2,
    fcut: 4,
  },
  PvuII: {
    rseq: "CAGCTG",
    rcut: 3,
    fcut: 3,
  },
  SacI: {
    rseq: "GAGCTC",
    rcut: 1,
    fcut: 5,
  },
  SacII: {
    rseq: "CCGCGG",
    rcut: 2,
    fcut: 4,
  },
  SalI: {
    rseq: "GTCGAC",
    rcut: 5,
    fcut: 1,
  },
  ScaI: {
    rseq: "AGTACT",
    rcut: 3,
    fcut: 3,
  },
  SfcI: {
    rseq: "CTRYAG",
    rcut: 5,
    fcut: 1,
  },
  SfoI: {
    rseq: "GGCGCC",
    rcut: 3,
    fcut: 3,
  },
  SmaI: {
    rseq: "CCCGGG",
    rcut: 3,
    fcut: 3,
  },
  SmlI: {
    rseq: "CTYRAG",
    rcut: 5,
    fcut: 1,
  },
  SnaBI: {
    rseq: "TACGTA",
    rcut: 3,
    fcut: 3,
  },
  SpeI: {
    rseq: "ACTAGT",
    rcut: 5,
    fcut: 1,
  },
  SphI: {
    rseq: "GCATGC",
    rcut: 1,
    fcut: 5,
  },
  SspI: {
    rseq: "AATATT",
    rcut: 3,
    fcut: 3,
  },
  StuI: {
    rseq: "AGGCCT",
    rcut: 3,
    fcut: 3,
  },
  StyI: {
    rseq: "CCWWGG",
    rcut: 5,
    fcut: 1,
  },
  TspMI: {
    rseq: "CCCGGG",
    rcut: 5,
    fcut: 1,
  },
  Tth111I: {
    rseq: "GACNNNGTC",
    rcut: 5,
    fcut: 4,
  },
  XbaI: {
    rseq: "TCTAGA",
    rcut: 5,
    fcut: 1,
  },
  XcmI: {
    rseq: "CCANNNNNNNNNTGG",
    rcut: 7,
    fcut: 8,
  },
  XhoI: {
    rseq: "CTCGAG",
    rcut: 5,
    fcut: 1,
  },
  XmaI: {
    rseq: "CCCGGG",
    rcut: 5,
    fcut: 1,
  },
  XmnI: {
    rseq: "GAANNNNTTC",
    rcut: 5,
    fcut: 5,
  },
  ZraI: {
    rseq: "GACGTC",
    rcut: 3,
    fcut: 3,
  },
  AlwI: {
    rseq: "GGATCNNNNN",
    rcut: 10,
    fcut: 9,
  },
  ApeKI: {
    rseq: "GCWGC",
    rcut: 4,
    fcut: 1,
  },
  AvaII: {
    rseq: "GGWCC",
    rcut: 4,
    fcut: 1,
  },
  BbvI: {
    rseq: "GCAGCNNNNNNNNNNNN",
    rcut: 17,
    fcut: 13,
  },
  BccI: {
    rseq: "CCATCNNNNN",
    rcut: 10,
    fcut: 9,
  },
  BceAI: {
    rseq: "ACGGCNNNNNNNNNNNNNN",
    rcut: 19,
    fcut: 17,
  },
  BcoDI: {
    rseq: "GTCTCNNNNN",
    rcut: 10,
    fcut: 6,
  },
  BsmAI: {
    rseq: "GTCTCNNNNN",
    rcut: 10,
    fcut: 6,
  },
  BsmFI: {
    rseq: "GGGACNNNNNNNNNNNNNN",
    rcut: 19,
    fcut: 15,
  },
  BspCNI: {
    rseq: "CTCAGNNNNNNNNN",
    rcut: 12,
    fcut: 14,
  },
  BsrI: {
    rseq: "ACTGGN",
    rcut: 4,
    fcut: 6,
  },
  BstNI: {
    rseq: "CCWGG",
    rcut: 3,
    fcut: 2,
  },
  BtsCI: {
    rseq: "GGATGNN",
    rcut: 5,
    fcut: 7,
  },
  BtsIMutI: {
    rseq: "CAGTGNN",
    rcut: 5,
    fcut: 7,
  },
  DpnI: {
    rseq: "GmATC",
    rcut: 3,
    fcut: 3,
  },
  FauI: {
    rseq: "CCCGCNNNNNN",
    rcut: 11,
    fcut: 9,
  },
  FokI: {
    rseq: "GGATGNNNNNNNNNNNNN",
    rcut: 18,
    fcut: 14,
  },
  HgaI: {
    rseq: "GACGCNNNNNNNNNN",
    rcut: 15,
    fcut: 10,
  },
  HphI: {
    rseq: "GGTGANNNNNNNN",
    rcut: 12,
    fcut: 13,
  },
  Hpy99I: {
    rseq: "CGWCG",
    rcut: 0,
    fcut: 5,
  },
  HpyAV: {
    rseq: "CCTTCNNNNNN",
    rcut: 10,
    fcut: 11,
  },
  LpnPI: {
    rseq: "CmCDGNNNNNNNNNNNNNN",
    rcut: 19,
    fcut: 15,
  },
  MboII: {
    rseq: "GAAGANNNNNNNN",
    rcut: 12,
    fcut: 13,
  },
  MlyI: {
    rseq: "GAGTCNNNNN",
    rcut: 10,
    fcut: 10,
  },
  NciI: {
    rseq: "CCSGG",
    rcut: 3,
    fcut: 2,
  },
  PleI: {
    rseq: "GAGTCNNNNN",
    rcut: 10,
    fcut: 9,
  },
  PspGI: {
    rseq: "CCWGG",
    rcut: 5,
    fcut: 0,
  },
  SfaNI: {
    rseq: "GCATCNNNNNNNNN",
    rcut: 14,
    fcut: 10,
  },
  TfiI: {
    rseq: "GAWTC",
    rcut: 4,
    fcut: 1,
  },
  TseI: {
    rseq: "GCWGC",
    rcut: 4,
    fcut: 1,
  },
  Tsp45I: {
    rseq: "GTSAC",
    rcut: 5,
    fcut: 0,
  },
  TspRI: {
    rseq: "NNCASTGNN",
    rcut: 0,
    fcut: 9,
  },
  AciI: {
    rseq: "CCGC",
    rcut: 3,
    fcut: 1,
  },
  AluI: {
    rseq: "AGCT",
    rcut: 2,
    fcut: 2,
  },
  BfaI: {
    rseq: "CTAG",
    rcut: 3,
    fcut: 1,
  },
  BsaJI: {
    rseq: "CCNNGG",
    rcut: 5,
    fcut: 1,
  },
  BslI: {
    rseq: "CCNNNNNNNGG",
    rcut: 4,
    fcut: 7,
  },
  BstUI: {
    rseq: "CGCG",
    rcut: 2,
    fcut: 2,
  },
  Cac8I: {
    rseq: "GCNNGC",
    rcut: 3,
    fcut: 3,
  },
  CviAII: {
    rseq: "CATG",
    rcut: 3,
    fcut: 1,
  },
  "CviKI-1": {
    rseq: "RGCY",
    rcut: 2,
    fcut: 2,
  },
  CviQI: {
    rseq: "GTAC",
    rcut: 3,
    fcut: 1,
  },
  DdeI: {
    rseq: "CTNAG",
    rcut: 4,
    fcut: 1,
  },
  DpnII: {
    rseq: "GATC",
    rcut: 4,
    fcut: 0,
  },
  FatI: {
    rseq: "CATG",
    rcut: 4,
    fcut: 0,
  },
  Fnu4HI: {
    rseq: "GCNGC",
    rcut: 3,
    fcut: 2,
  },
  HaeIII: {
    rseq: "GGCC",
    rcut: 2,
    fcut: 2,
  },
  HhaI: {
    rseq: "GCGC",
    rcut: 1,
    fcut: 3,
  },
  HinP1I: {
    rseq: "GCGC",
    rcut: 3,
    fcut: 1,
  },
  HinfI: {
    rseq: "GANTC",
    rcut: 4,
    fcut: 1,
  },
  HpaII: {
    rseq: "CCGG",
    rcut: 3,
    fcut: 1,
  },
  Hpy166II: {
    rseq: "GTNNAC",
    rcut: 3,
    fcut: 3,
  },
  Hpy188I: {
    rseq: "TCNGA",
    rcut: 2,
    fcut: 3,
  },
  Hpy188III: {
    rseq: "TCNNGA",
    rcut: 4,
    fcut: 2,
  },
  HpyCH4III: {
    rseq: "ACNGT",
    rcut: 2,
    fcut: 3,
  },
  HpyCH4IV: {
    seq: "ACGT",
    rcut: 3,
    fcut: 1,
  },
  HpyCH4V: {
    rseq: "TGCA",
    rcut: 2,
    fcut: 2,
  },
  MboI: {
    rseq: "GATC",
    rcut: 4,
    fcut: 0,
  },
  MluCI: {
    rseq: "AATT",
    rcut: 4,
    fcut: 0,
  },
  MnlI: {
    rseq: "CCTCNNNNNNN",
    rcut: 10,
    fcut: 11,
  },
  MseI: {
    rseq: "TTAA",
    rcut: 3,
    fcut: 1,
  },
  MspI: {
    rseq: "CCGG",
    rcut: 3,
    fcut: 1,
  },
  MwoI: {
    rseq: "GCNNNNNNNGC",
    rcut: 4,
    fcut: 7,
  },
  NlaIII: {
    rseq: "CATG",
    rcut: 0,
    fcut: 4,
  },
  NlaIV: {
    rseq: "GGNNCC",
    rcut: 3,
    fcut: 3,
  },
  RsaI: {
    rseq: "GTAC",
    rcut: 2,
    fcut: 2,
  },
  Sau3AI: {
    rseq: "GATC",
    rcut: 4,
    fcut: 0,
  },
  Sau96I: {
    rseq: "GGNCC",
    rcut: 4,
    fcut: 1,
  },
  ScrFI: {
    rseq: "CCNGG",
    rcut: 3,
    fcut: 2,
  },
  StyD4I: {
    rseq: "CCNGG",
    rcut: 5,
    fcut: 0,
  },
  TaqI: {
    rseq: "TCGA",
    rcut: 3,
    fcut: 1,
  },
  AbaSI: {
    rseq: "hmCNNNNNNNNNNN",
    rcut: 12,
    fcut: 14,
  },
  FspEI: {
    rseq: "CmCNNNNNNNNNNNNNNNN",
    rcut: 19,
    fcut: 15,
  },
  MspJI: {
    rseq: "mCNNRNNNNNNNNNNNNN",
    rcut: 18,
    fcut: 14,
  },
};
