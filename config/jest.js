const Enzyme = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");
const sizeMe = require("react-sizeme");

Enzyme.configure({ adapter: new Adapter() });

sizeMe.noPlaceholders = true;

jest.setTimeout(5000);

require("jest-fetch-mock").enableMocks();
fetchMock.dontMock();
