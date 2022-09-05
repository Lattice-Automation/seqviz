import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

export const urlParams = () => {
  if (history.location.search) {
    const query = new URLSearchParams(history.location.search);
    return {
      backbone: query.get("backbone"),
      biobrick: query.get("biobrick"),
    };
  }

  return {
    backbone: "",
    biobrick: "",
  };
};

/**
 * Using URL for backbone and biobrick state. Update both
 */
export const updateUrl = query => {
  // Destructuring to 0 is to handle the case where the user has deleted the input
  // We need to be able to differentiate between empty string and null
  // So we set null to 0 and let empty string pass through
  const backbone = !("backbone" in query) ? urlParams().backbone : query.backbone;
  const biobrick = !("biobrick" in query) ? urlParams().biobrick : query.biobrick;
  const search = `?backbone=${backbone}&biobrick=${biobrick}`;

  history.push(search);
};
