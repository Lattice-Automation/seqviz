import * as React from "react";

const defaultCentralIndex = {
  linear: 0,
  circular: 0,
  setCentralIndex: () => {},
};

/** Default central index context object */
const CentralIndexContext = React.createContext(defaultCentralIndex);
CentralIndexContext.displayName = "CentralIndexContext";

export default CentralIndexContext;
