export const queryKeys = {
  backbone: "",
  biobrick: ""
};

export const urlParams = () => {
  let params = queryKeys;
  if (window.location.search) {
    const queries = new URLSearchParams(window.location.search);
    queries.forEach((value, key) => {
      if (key in queryKeys) {
        params = { ...params, ...{ [key]: value } };
      }
    });
  }
  return params;
};

export const constructQuery = options => {
  let { backbone, biobrick } = options;
  backbone = backbone || urlParams().backbone || "";
  biobrick = biobrick || urlParams().biobrick || "";
  return `?backbone=${backbone}&biobrick=${biobrick}`;
};

export const updateUrl = query => {
  window.history.pushState({}, "", query);
};
