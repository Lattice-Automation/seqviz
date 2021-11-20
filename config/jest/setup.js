const Enzyme = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");
const sizeMe = require("react-sizeme");
require("core-js/stable");
require("regenerator-runtime/runtime");

Enzyme.configure({ adapter: new Adapter() });

sizeMe.noPlaceholders = true;

localStorage.clear();

jest.setTimeout(30000);
