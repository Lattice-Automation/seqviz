import * as React from "react";

const defaultCentralIndex = {
  circular: 0,
  linear: 0,
  setCentralIndex: (_: number) => {},
};

/** Default central index context object */
const CentralIndexContext = React.createContext(defaultCentralIndex);
CentralIndexContext.displayName = "CentralIndexContext";

export default CentralIndexContext;
