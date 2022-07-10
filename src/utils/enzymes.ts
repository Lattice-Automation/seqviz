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
  AatII: {
    fcut: 5,
    rcut: 1,
    rseq: "GACGTC",
  },
  AbaSI: {
    fcut: 14,
    rcut: 12,
    rseq: "hmCNNNNNNNNNNN",
  },
  Acc65I: {
    fcut: 1,
    rcut: 5,
    rseq: "GGTACC",
  },
  AccI: {
    fcut: 2,
    rcut: 4,
    rseq: "GTMKAC",
  },
  AciI: {
    fcut: 1,
    rcut: 3,
    rseq: "CCGC",
  },
  AclI: {
    fcut: 2,
    rcut: 4,
    rseq: "AACGTT",
  },
  AcuI: {
    fcut: 22,
    rcut: 20,
    rseq: "CTGAAGNNNNNNNNNNNNNNNN",
  },
  AfeI: {
    fcut: 3,
    rcut: 3,
    rseq: "AGCGCT",
  },
  AflII: {
    fcut: 1,
    rcut: 5,
    rseq: "CTTAAG",
  },
  AflIII: {
    fcut: 1,
    rcut: 5,
    rseq: "ACRYGT",
  },
  AgeI: {
    fcut: 1,
    rcut: 5,
    rseq: "ACCGGT",
  },
  AhdI: {
    fcut: 6,
    rcut: 5,
    rseq: "GACNNNNNGTC",
  },
  AleI: {
    fcut: 5,
    rcut: 5,
    rseq: "CACNNNNGTG",
  },
  AluI: {
    fcut: 2,
    rcut: 2,
    rseq: "AGCT",
  },
  AlwI: {
    fcut: 9,
    rcut: 10,
    rseq: "GGATCNNNNN",
  },
  AlwNI: {
    fcut: 6,
    rcut: 3,
    rseq: "CAGNNNCTG",
  },
  ApaI: {
    fcut: 5,
    rcut: 1,
    rseq: "GGGCCC",
  },
  ApaLI: {
    fcut: 1,
    rcut: 5,
    rseq: "GTGCAC",
  },
  ApeKI: {
    fcut: 1,
    rcut: 4,
    rseq: "GCWGC",
  },
  ApoI: {
    fcut: 1,
    rcut: 5,
    rseq: "RAATTY",
  },
  AscI: {
    fcut: 2,
    rcut: 6,
    rseq: "GGCGCGCC",
  },
  AseI: {
    fcut: 2,
    rcut: 4,
    rseq: "ATTAAT",
  },
  AsiSI: {
    fcut: 5,
    rcut: 3,
    rseq: "GCGATCGC",
  },
  AvaI: {
    fcut: 1,
    rcut: 5,
    rseq: "CYCGRG",
  },
  AvaII: {
    fcut: 1,
    rcut: 4,
    rseq: "GGWCC",
  },
  AvrII: {
    fcut: 1,
    rcut: 5,
    rseq: "CCTAGG",
  },
  BaeGI: {
    fcut: 5,
    rcut: 1,
    rseq: "GKGCMC",
  },
  BaeI: {
    fcut: 38,
    rcut: 33,
    rseq: "NNNNNNNNNNNNNNNACNNNNGTAYCNNNNNNNNNNNN",
  },
  BamHI: {
    fcut: 1,
    rcut: 5,
    rseq: "GGATCC",
  },
  BanI: {
    fcut: 1,
    rcut: 5,
    rseq: "GGYRCC",
  },
  BanII: {
    fcut: 5,
    rcut: 1,
    rseq: "GRGCYC",
  },
  BbsI: {
    fcut: 8,
    rcut: 12,
    rseq: "GAAGACNNNNNN",
  },
  BbvCI: {
    fcut: 2,
    rcut: 5,
    rseq: "CCTCAGC",
  },
  BbvI: {
    fcut: 13,
    rcut: 17,
    rseq: "GCAGCNNNNNNNNNNNN",
  },
  BccI: {
    fcut: 9,
    rcut: 10,
    rseq: "CCATCNNNNN",
  },
  BceAI: {
    fcut: 17,
    rcut: 19,
    rseq: "ACGGCNNNNNNNNNNNNNN",
  },
  BcgI: {
    fcut: 36,
    rcut: 34,
    rseq: "NNNNNNNNNNNNCGANNNNNNTGCNNNNNNNNNNNN",
  },
  BciVI: {
    fcut: 12,
    rcut: 11,
    rseq: "GTATCCNNNNNN",
  },
  BclI: {
    fcut: 1,
    rcut: 5,
    rseq: "TGATCA",
  },
  BcoDI: {
    fcut: 6,
    rcut: 10,
    rseq: "GTCTCNNNNN",
  },
  BfaI: {
    fcut: 1,
    rcut: 3,
    rseq: "CTAG",
  },
  BfuAI: {
    fcut: 10,
    rcut: 14,
    rseq: "ACCTGCNNNNNNNN",
  },
  BglI: {
    fcut: 7,
    rcut: 4,
    rseq: "GCCNNNNNGGC",
  },
  BglII: {
    fcut: 1,
    rcut: 5,
    rseq: "AGATCT",
  },
  BlpI: {
    fcut: 2,
    rcut: 5,
    rseq: "GCTNAGC",
  },
  BmgBI: {
    fcut: 3,
    rcut: 3,
    rseq: "CACGTC",
  },
  BmrI: {
    fcut: 11,
    rcut: 10,
    rseq: "ACTGGGNNNNN",
  },
  BmtI: {
    fcut: 5,
    rcut: 1,
    rseq: "GCTAGC",
  },
  BpmI: {
    fcut: 22,
    rcut: 20,
    rseq: "CTGGAGNNNNNNNNNNNNNNNN",
  },
  Bpu10I: {
    fcut: 2,
    rcut: 5,
    rseq: "CCTNAGC",
  },
  BpuEI: {
    fcut: 22,
    rcut: 20,
    rseq: "CTTGAGNNNNNNNNNNNNNNNN",
  },
  BsaAI: {
    fcut: 3,
    rcut: 3,
    rseq: "YACGTR",
  },
  BsaBI: {
    fcut: 5,
    rcut: 5,
    rseq: "GATNNNNATC",
  },
  BsaHI: {
    fcut: 2,
    rcut: 4,
    rseq: "GRCGYC",
  },
  BsaI: {
    fcut: 7,
    rcut: 11,
    rseq: "GGTCTCNNNNN",
  },
  BsaJI: {
    fcut: 1,
    rcut: 5,
    rseq: "CCNNGG",
  },
  BsaWI: {
    fcut: 1,
    rcut: 5,
    rseq: "WCCGGW",
  },
  BsaXI: {
    fcut: 33,
    rcut: 30,
    rseq: "NNNNNNNNNNNNACNNNNNCTCCNNNNNNNNNN",
  },
  BseRI: {
    fcut: 16,
    rcut: 14,
    rseq: "GAGGAGNNNNNNNNNN",
  },
  BseYI: {
    fcut: 1,
    rcut: 5,
    rseq: "CCCAGC",
  },
  BsgI: {
    fcut: 22,
    rcut: 20,
    rseq: "GTGCAGNNNNNNNNNNNNNNNN",
  },
  BsiEI: {
    fcut: 4,
    rcut: 2,
    rseq: "CGRYCG",
  },
  BsiHKAI: {
    fcut: 5,
    rcut: 1,
    rseq: "GWGCWC",
  },
  BsiWI: {
    fcut: 1,
    rcut: 5,
    rseq: "CGTACG",
  },
  BslI: {
    fcut: 7,
    rcut: 4,
    rseq: "CCNNNNNNNGG",
  },
  BsmAI: {
    fcut: 6,
    rcut: 10,
    rseq: "GTCTCNNNNN",
  },
  BsmBI: {
    fcut: 7,
    rcut: 11,
    rseq: "CGTCTCNNNNN",
  },
  BsmFI: {
    fcut: 15,
    rcut: 19,
    rseq: "GGGACNNNNNNNNNNNNNN",
  },
  BsmI: {
    fcut: 7,
    rcut: 5,
    rseq: "GAATGCN",
  },
  BsoBI: {
    fcut: 1,
    rcut: 5,
    rseq: "CYCGRG",
  },
  Bsp1286I: {
    fcut: 5,
    rcut: 1,
    rseq: "GDGCHC",
  },
  BspCNI: {
    fcut: 14,
    rcut: 12,
    rseq: "CTCAGNNNNNNNNN",
  },
  BspDI: {
    fcut: 2,
    rcut: 4,
    rseq: "ATCGAT",
  },
  BspEI: {
    fcut: 1,
    rcut: 5,
    rseq: "TCCGGA",
  },
  BspHI: {
    fcut: 1,
    rcut: 5,
    rseq: "TCATGA",
  },
  BspMI: {
    fcut: 10,
    rcut: 14,
    rseq: "ACCTGCNNNNNNNN",
  },
  BspQI: {
    fcut: 8,
    rcut: 11,
    rseq: "GCTCTTCNNNN",
  },
  BsrBI: {
    fcut: 3,
    rcut: 3,
    rseq: "CCGCTC",
  },
  BsrDI: {
    fcut: 8,
    rcut: 6,
    rseq: "GCAATGNN",
  },
  BsrFI: {
    fcut: 1,
    rcut: 5,
    rseq: "RCCGGY",
  },
  BsrGI: {
    fcut: 1,
    rcut: 5,
    rseq: "TGTACA",
  },
  BsrI: {
    fcut: 6,
    rcut: 4,
    rseq: "ACTGGN",
  },
  BssHII: {
    fcut: 1,
    rcut: 5,
    rseq: "GCGCGC",
  },
  BssSI: {
    fcut: 1,
    rcut: 5,
    rseq: "CACGAG",
  },
  BstAPI: {
    fcut: 7,
    rcut: 4,
    rseq: "GCANNNNNTGC",
  },
  BstBI: {
    fcut: 2,
    rcut: 4,
    rseq: "TTCGAA",
  },
  BstEII: {
    fcut: 1,
    rcut: 6,
    rseq: "GGTNACC",
  },
  BstNI: {
    fcut: 2,
    rcut: 3,
    rseq: "CCWGG",
  },
  BstUI: {
    fcut: 2,
    rcut: 2,
    rseq: "CGCG",
  },
  BstXI: {
    fcut: 8,
    rcut: 4,
    rseq: "CCANNNNNNTGG",
  },
  BstYI: {
    fcut: 1,
    rcut: 5,
    rseq: "RGATCY",
  },
  BstZ17I: {
    fcut: 3,
    rcut: 3,
    rseq: "GTATAC",
  },
  Bsu36I: {
    fcut: 2,
    rcut: 5,
    rseq: "CCTNAGG",
  },
  BtgI: {
    fcut: 1,
    rcut: 5,
    rseq: "CCRYGG",
  },
  BtgZI: {
    fcut: 16,
    rcut: 20,
    rseq: "GCGATGNNNNNNNNNNNNNN",
  },
  BtsCI: {
    fcut: 7,
    rcut: 5,
    rseq: "GGATGNN",
  },
  BtsI: {
    fcut: 8,
    rcut: 6,
    rseq: "GCAGTGNN",
  },
  BtsIMutI: {
    fcut: 7,
    rcut: 5,
    rseq: "CAGTGNN",
  },
  Cac8I: {
    fcut: 3,
    rcut: 3,
    rseq: "GCNNGC",
  },
  ClaI: {
    fcut: 2,
    rcut: 4,
    rseq: "ATCGAT",
  },
  CspCI: {
    fcut: 37,
    rcut: 35,
    rseq: "NNNNNNNNNNNNNCAANNNNNGTGGNNNNNNNNNNNN",
  },
  CviAII: {
    fcut: 1,
    rcut: 3,
    rseq: "CATG",
  },
  "CviKI-1": {
    fcut: 2,
    rcut: 2,
    rseq: "RGCY",
  },
  CviQI: {
    fcut: 1,
    rcut: 3,
    rseq: "GTAC",
  },
  DdeI: {
    fcut: 1,
    rcut: 4,
    rseq: "CTNAG",
  },
  DpnI: {
    fcut: 3,
    rcut: 3,
    rseq: "GmATC",
  },
  DpnII: {
    fcut: 0,
    rcut: 4,
    rseq: "GATC",
  },
  DraI: {
    fcut: 3,
    rcut: 3,
    rseq: "TTTAAA",
  },
  DraIII: {
    fcut: 6,
    rcut: 3,
    rseq: "CACNNNGTG",
  },
  DrdI: {
    fcut: 7,
    rcut: 5,
    rseq: "GACNNNNNNGTC",
  },
  EaeI: {
    fcut: 1,
    rcut: 5,
    rseq: "YGGCCR",
  },
  EagI: {
    fcut: 1,
    rcut: 5,
    rseq: "CGGCCG",
  },
  EarI: {
    fcut: 7,
    rcut: 10,
    rseq: "CTCTTCNNNN",
  },
  EciI: {
    fcut: 17,
    rcut: 15,
    rseq: "GGCGGANNNNNNNNNNN",
  },
  Eco53kI: {
    fcut: 3,
    rcut: 3,
    rseq: "GAGCTC",
  },
  EcoNI: {
    fcut: 5,
    rcut: 6,
    rseq: "CCTNNNNNAGG",
  },
  EcoO109I: {
    fcut: 2,
    rcut: 5,
    rseq: "RGGNCCY",
  },
  EcoRI: {
    fcut: 1,
    rcut: 5,
    rseq: "GAATTC",
  },
  EcoRV: {
    fcut: 3,
    rcut: 3,
    rseq: "GATATC",
  },
  Esp3I: {
    fcut: 7,
    rcut: 11,
    rseq: "CGTCTCNNNNN",
  },
  FatI: {
    fcut: 0,
    rcut: 4,
    rseq: "CATG",
  },
  FauI: {
    fcut: 9,
    rcut: 11,
    rseq: "CCCGCNNNNNN",
  },
  Fnu4HI: {
    fcut: 2,
    rcut: 3,
    rseq: "GCNGC",
  },
  FokI: {
    fcut: 14,
    rcut: 18,
    rseq: "GGATGNNNNNNNNNNNNN",
  },
  FseI: {
    fcut: 6,
    rcut: 2,
    rseq: "GGCCGGCC",
  },
  FspEI: {
    fcut: 15,
    rcut: 19,
    rseq: "CmCNNNNNNNNNNNNNNNN",
  },
  FspI: {
    fcut: 3,
    rcut: 3,
    rseq: "TGCGCA",
  },
  HaeII: {
    fcut: 5,
    rcut: 1,
    rseq: "RGCGCY",
  },
  HaeIII: {
    fcut: 2,
    rcut: 2,
    rseq: "GGCC",
  },
  HgaI: {
    fcut: 10,
    rcut: 15,
    rseq: "GACGCNNNNNNNNNN",
  },
  HhaI: {
    fcut: 3,
    rcut: 1,
    rseq: "GCGC",
  },
  HinP1I: {
    fcut: 1,
    rcut: 3,
    rseq: "GCGC",
  },
  HincII: {
    fcut: 3,
    rcut: 3,
    rseq: "GTYRAC",
  },
  HindIII: {
    fcut: 1,
    rcut: 5,
    rseq: "AAGCTT",
  },
  HinfI: {
    fcut: 1,
    rcut: 4,
    rseq: "GANTC",
  },
  HpaI: {
    fcut: 3,
    rcut: 3,
    rseq: "GTTAAC",
  },
  HpaII: {
    fcut: 1,
    rcut: 3,
    rseq: "CCGG",
  },
  HphI: {
    fcut: 13,
    rcut: 12,
    rseq: "GGTGANNNNNNNN",
  },
  Hpy166II: {
    fcut: 3,
    rcut: 3,
    rseq: "GTNNAC",
  },
  Hpy188I: {
    fcut: 3,
    rcut: 2,
    rseq: "TCNGA",
  },
  Hpy188III: {
    fcut: 2,
    rcut: 4,
    rseq: "TCNNGA",
  },
  Hpy99I: {
    fcut: 5,
    rcut: 0,
    rseq: "CGWCG",
  },
  HpyAV: {
    fcut: 11,
    rcut: 10,
    rseq: "CCTTCNNNNNN",
  },
  HpyCH4III: {
    fcut: 3,
    rcut: 2,
    rseq: "ACNGT",
  },
  HpyCH4IV: {
    fcut: 1,
    rcut: 3,
    seq: "ACGT",
  },
  HpyCH4V: {
    fcut: 2,
    rcut: 2,
    rseq: "TGCA",
  },
  "I-CeuI": {
    fcut: 18,
    rcut: 14,
    rseq: "TAACTATAACGGTCCTAAGGTAGCGAA",
  },
  "I-SceI": {
    fcut: 9,
    rcut: 5,
    rseq: "TAGGGATAACAGGGTAAT",
  },
  KasI: {
    fcut: 1,
    rcut: 5,
    rseq: "GGCGCC",
  },
  KpnI: {
    fcut: 5,
    rcut: 1,
    rseq: "GGTACC",
  },
  LpnPI: {
    fcut: 15,
    rcut: 19,
    rseq: "CmCDGNNNNNNNNNNNNNN",
  },
  MboI: {
    fcut: 0,
    rcut: 4,
    rseq: "GATC",
  },
  MboII: {
    fcut: 13,
    rcut: 12,
    rseq: "GAAGANNNNNNNN",
  },
  MfeI: {
    fcut: 1,
    rcut: 5,
    rseq: "CAATTG",
  },
  MluCI: {
    fcut: 0,
    rcut: 4,
    rseq: "AATT",
  },
  MluI: {
    fcut: 1,
    rcut: 5,
    rseq: "ACGCGT",
  },
  MlyI: {
    fcut: 10,
    rcut: 10,
    rseq: "GAGTCNNNNN",
  },
  MmeI: {
    fcut: 26,
    rcut: 24,
    rseq: "TCCRACNNNNNNNNNNNNNNNNNNNN",
  },
  MnlI: {
    fcut: 11,
    rcut: 10,
    rseq: "CCTCNNNNNNN",
  },
  MscI: {
    fcut: 3,
    rcut: 3,
    rseq: "TGGCCA",
  },
  MseI: {
    fcut: 1,
    rcut: 3,
    rseq: "TTAA",
  },
  MslI: {
    fcut: 5,
    rcut: 5,
    rseq: "CAYNNNNRTG",
  },
  MspA1I: {
    fcut: 3,
    rcut: 3,
    rseq: "CMGCKG",
  },
  MspI: {
    fcut: 1,
    rcut: 3,
    rseq: "CCGG",
  },
  MspJI: {
    fcut: 14,
    rcut: 18,
    rseq: "mCNNRNNNNNNNNNNNNN",
  },
  MwoI: {
    fcut: 7,
    rcut: 4,
    rseq: "GCNNNNNNNGC",
  },
  NaeI: {
    fcut: 3,
    rcut: 3,
    rseq: "GCCGGC",
  },
  NarI: {
    fcut: 2,
    rcut: 4,
    rseq: "GGCGCC",
  },
  NciI: {
    fcut: 2,
    rcut: 3,
    rseq: "CCSGG",
  },
  NcoI: {
    fcut: 1,
    rcut: 5,
    rseq: "CCATGG",
  },
  NdeI: {
    fcut: 2,
    rcut: 4,
    rseq: "CATATG",
  },
  NgoMIV: {
    fcut: 1,
    rcut: 5,
    rseq: "GCCGGC",
  },
  NheI: {
    fcut: 1,
    rcut: 5,
    rseq: "GCTAGC",
  },
  NlaIII: {
    fcut: 4,
    rcut: 0,
    rseq: "CATG",
  },
  NlaIV: {
    fcut: 3,
    rcut: 3,
    rseq: "GGNNCC",
  },
  NmeAIII: {
    fcut: 26,
    rcut: 25,
    rseq: "GCCGAGNNNNNNNNNNNNNNNNNNNN",
  },
  NotI: {
    fcut: 2,
    rcut: 6,
    rseq: "GCGGCCGC",
  },
  NruI: {
    fcut: 3,
    rcut: 3,
    rseq: "TCGCGA",
  },
  NsiI: {
    fcut: 5,
    rcut: 1,
    rseq: "ATGCAT",
  },
  NspI: {
    fcut: 5,
    rcut: 1,
    rseq: "RCATGY",
  },
  "PI-PspI": {
    fcut: 17,
    rcut: 13,
    rseq: "TGGCAAACAGCTATTATGGGTATTATGGGT",
  },
  "PI-SceI": {
    fcut: 15,
    rcut: 11,
    rseq: "ATCTATGTCGGGTGCGGAGAAAGAGGTAATGAAATGG",
  },
  PacI: {
    fcut: 5,
    rcut: 3,
    rseq: "TTAATTAA",
  },
  PaeR7I: {
    fcut: 1,
    rcut: 5,
    rseq: "CTCGAG",
  },
  PciI: {
    fcut: 1,
    rcut: 5,
    rseq: "ACATGT",
  },
  PflFI: {
    fcut: 4,
    rcut: 5,
    rseq: "GACNNNGTC",
  },
  PflMI: {
    fcut: 7,
    rcut: 4,
    rseq: "CCANNNNNTGG",
  },
  PleI: {
    fcut: 9,
    rcut: 10,
    rseq: "GAGTCNNNNN",
  },
  PluTI: {
    fcut: 5,
    rcut: 1,
    rseq: "GGCGCC",
  },
  PmeI: {
    fcut: 4,
    rcut: 4,
    rseq: "GTTTAAAC",
  },
  PmlI: {
    fcut: 3,
    rcut: 3,
    rseq: "CACGTG",
  },
  PpuMI: {
    fcut: 2,
    rcut: 5,
    rseq: "RGGWCCY",
  },
  PshAI: {
    fcut: 5,
    rcut: 5,
    rseq: "GACNNNNGTC",
  },
  PsiI: {
    fcut: 3,
    rcut: 3,
    rseq: "TTATAA",
  },
  PspGI: {
    fcut: 0,
    rcut: 5,
    rseq: "CCWGG",
  },
  PspOMI: {
    fcut: 1,
    rcut: 5,
    rseq: "GGGCCC",
  },
  PspXI: {
    fcut: 2,
    rcut: 6,
    rseq: "VCTCGAGB",
  },
  PstI: {
    fcut: 5,
    rcut: 1,
    rseq: "CTGCAG",
  },
  PvuI: {
    fcut: 4,
    rcut: 2,
    rseq: "CGATCG",
  },
  PvuII: {
    fcut: 3,
    rcut: 3,
    rseq: "CAGCTG",
  },
  RsaI: {
    fcut: 2,
    rcut: 2,
    rseq: "GTAC",
  },
  RsrII: {
    fcut: 2,
    rcut: 5,
    rseq: "CGGWCCG",
  },
  SacI: {
    fcut: 5,
    rcut: 1,
    rseq: "GAGCTC",
  },
  SacII: {
    fcut: 4,
    rcut: 2,
    rseq: "CCGCGG",
  },
  SalI: {
    fcut: 1,
    rcut: 5,
    rseq: "GTCGAC",
  },
  SapI: {
    fcut: 8,
    rcut: 11,
    rseq: "GCTCTTCNNNN",
  },
  Sau3AI: {
    fcut: 0,
    rcut: 4,
    rseq: "GATC",
  },
  Sau96I: {
    fcut: 1,
    rcut: 4,
    rseq: "GGNCC",
  },
  SbfI: {
    fcut: 6,
    rcut: 2,
    rseq: "CCTGCAGG",
  },
  ScaI: {
    fcut: 3,
    rcut: 3,
    rseq: "AGTACT",
  },
  ScrFI: {
    fcut: 2,
    rcut: 3,
    rseq: "CCNGG",
  },
  SexAI: {
    fcut: 1,
    rcut: 6,
    rseq: "ACCWGGT",
  },
  SfaNI: {
    fcut: 10,
    rcut: 14,
    rseq: "GCATCNNNNNNNNN",
  },
  SfcI: {
    fcut: 1,
    rcut: 5,
    rseq: "CTRYAG",
  },
  SfiI: {
    fcut: 8,
    rcut: 5,
    rseq: "GGCCNNNNNGGCC",
  },
  SfoI: {
    fcut: 3,
    rcut: 3,
    rseq: "GGCGCC",
  },
  SgrAI: {
    fcut: 2,
    rcut: 6,
    rseq: "CRCCGGYG",
  },
  SmaI: {
    fcut: 3,
    rcut: 3,
    rseq: "CCCGGG",
  },
  SmlI: {
    fcut: 1,
    rcut: 5,
    rseq: "CTYRAG",
  },
  SnaBI: {
    fcut: 3,
    rcut: 3,
    rseq: "TACGTA",
  },
  SpeI: {
    fcut: 1,
    rcut: 5,
    rseq: "ACTAGT",
  },
  SphI: {
    fcut: 5,
    rcut: 1,
    rseq: "GCATGC",
  },
  SrfI: {
    fcut: 4,
    rcut: 4,
    rseq: "GCCCGGGC",
  },
  SspI: {
    fcut: 3,
    rcut: 3,
    rseq: "AATATT",
  },
  StuI: {
    fcut: 3,
    rcut: 3,
    rseq: "AGGCCT",
  },
  StyD4I: {
    fcut: 0,
    rcut: 5,
    rseq: "CCNGG",
  },
  StyI: {
    fcut: 1,
    rcut: 5,
    rseq: "CCWWGG",
  },
  SwaI: {
    fcut: 4,
    rcut: 4,
    rseq: "ATTTAAAT",
  },
  TaqI: {
    fcut: 1,
    rcut: 3,
    rseq: "TCGA",
  },
  TfiI: {
    fcut: 1,
    rcut: 4,
    rseq: "GAWTC",
  },
  TseI: {
    fcut: 1,
    rcut: 4,
    rseq: "GCWGC",
  },
  Tsp45I: {
    fcut: 0,
    rcut: 5,
    rseq: "GTSAC",
  },
  TspMI: {
    fcut: 1,
    rcut: 5,
    rseq: "CCCGGG",
  },
  TspRI: {
    fcut: 9,
    rcut: 0,
    rseq: "NNCASTGNN",
  },
  Tth111I: {
    fcut: 4,
    rcut: 5,
    rseq: "GACNNNGTC",
  },
  XbaI: {
    fcut: 1,
    rcut: 5,
    rseq: "TCTAGA",
  },
  XcmI: {
    fcut: 8,
    rcut: 7,
    rseq: "CCANNNNNNNNNTGG",
  },
  XhoI: {
    fcut: 1,
    rcut: 5,
    rseq: "CTCGAG",
  },
  XmaI: {
    fcut: 1,
    rcut: 5,
    rseq: "CCCGGG",
  },
  XmnI: {
    fcut: 5,
    rcut: 5,
    rseq: "GAANNNNTTC",
  },
  ZraI: {
    fcut: 3,
    rcut: 3,
    rseq: "GACGTC",
  },
};
