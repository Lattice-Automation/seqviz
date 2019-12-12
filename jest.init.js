import "core-js/stable";
import "regenerator-runtime/runtime";
import sizeMe from "react-sizeme";

var enzyme = require("enzyme");
var Adapter = require("enzyme-adapter-react-16");

sizeMe.noPlaceholders = true;

enzyme.configure({ adapter: new Adapter() });
