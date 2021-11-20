import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import sizeMe from "react-sizeme";
// import fetch from "jest-fetch-mock";
import "core-js/stable";
import "regenerator-runtime/runtime";

Enzyme.configure({ adapter: new Adapter() });

sizeMe.noPlaceholders = true;

// global.fetch = fetch;
localStorage.clear();

jest.setTimeout(30000);
