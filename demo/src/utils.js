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
  let { backbone = 0, biobrick = 0 } = options;
  // Destructuring to 0 is to handle the case where the user has deleted the input
  // We need to be able to differentiate between empty string and null
  // So we set null to 0 and let empty string pass through
  backbone = backbone === 0 ? urlParams().backbone : backbone;
  biobrick = biobrick === 0 ? urlParams().biobrick : biobrick;
  return `?backbone=${backbone}&biobrick=${biobrick}`;
};

export const updateUrl = query => {
  window.history.pushState({}, "", query);
};
