import sizeMe from "react-sizeme";
import "babel-polyfill";

var enzyme = require("enzyme");
var Adapter = require("enzyme-adapter-react-16");

sizeMe.noPlaceholders = true;

enzyme.configure({ adapter: new Adapter() });
