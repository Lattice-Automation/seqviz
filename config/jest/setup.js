import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import sizeMe from "react-sizeme";
import "core-js/stable";
import "regenerator-runtime/runtime";

Enzyme.configure({ adapter: new Adapter() });

sizeMe.noPlaceholders = true;
