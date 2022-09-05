exports.id = 152;
exports.ids = [152];
exports.modules = {

/***/ 495:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({
    value: true
});
exports.Z = _extends;
function _extends() {
    return extends_.apply(this, arguments);
}
function extends_() {
    extends_ = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return extends_.apply(this, arguments);
}


/***/ }),

/***/ 648:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({
    value: true
});
exports.Z = _interopRequireDefault;
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}


/***/ }),

/***/ 638:
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports["default"] = dynamic;
exports.noSSR = noSSR;
var _extends = (__webpack_require__(495)/* ["default"] */ .Z);
var _interop_require_default = (__webpack_require__(648)/* ["default"] */ .Z);
var _react = _interop_require_default(__webpack_require__(689));
var _loadable = _interop_require_default(__webpack_require__(832));
function dynamic(dynamicOptions, options) {
    let loadableFn = _loadable.default;
    let loadableOptions = {
        // A loading component is not required, so we default it
        loading: ({ error , isLoading , pastDelay  })=>{
            if (!pastDelay) return null;
            if (false) {}
            return null;
        }
    };
    // Support for direct import(), eg: dynamic(import('../hello-world'))
    // Note that this is only kept for the edge case where someone is passing in a promise as first argument
    // The react-loadable babel plugin will turn dynamic(import('../hello-world')) into dynamic(() => import('../hello-world'))
    // To make sure we don't execute the import without rendering first
    if (dynamicOptions instanceof Promise) {
        loadableOptions.loader = ()=>dynamicOptions;
    // Support for having import as a function, eg: dynamic(() => import('../hello-world'))
    } else if (typeof dynamicOptions === "function") {
        loadableOptions.loader = dynamicOptions;
    // Support for having first argument being options, eg: dynamic({loader: import('../hello-world')})
    } else if (typeof dynamicOptions === "object") {
        loadableOptions = _extends({}, loadableOptions, dynamicOptions);
    }
    // Support for passing options, eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
    loadableOptions = _extends({}, loadableOptions, options);
    // Error if Fizz rendering is not enabled and `suspense` option is set to true
    if ( true && loadableOptions.suspense) {
        throw new Error(`Invalid suspense option usage in next/dynamic. Read more: https://nextjs.org/docs/messages/invalid-dynamic-suspense`);
    }
    // coming from build/babel/plugins/react-loadable-plugin.js
    if (loadableOptions.loadableGenerated) {
        loadableOptions = _extends({}, loadableOptions, loadableOptions.loadableGenerated);
        delete loadableOptions.loadableGenerated;
    }
    // support for disabling server side rendering, eg: dynamic(import('../hello-world'), {ssr: false}).
    // skip `ssr` for suspense mode and opt-in React.lazy directly
    if (typeof loadableOptions.ssr === "boolean" && !loadableOptions.suspense) {
        if (!loadableOptions.ssr) {
            delete loadableOptions.ssr;
            return noSSR(loadableFn, loadableOptions);
        }
        delete loadableOptions.ssr;
    }
    return loadableFn(loadableOptions);
}
const isServerSide = "undefined" === "undefined";
function noSSR(LoadableInitializer, loadableOptions) {
    // Removing webpack and modules means react-loadable won't try preloading
    delete loadableOptions.webpack;
    delete loadableOptions.modules;
    // This check is necessary to prevent react-loadable from initializing on the server
    if (!isServerSide) {
        return LoadableInitializer(loadableOptions);
    }
    const Loading = loadableOptions.loading;
    // This will only be rendered on the server side
    return ()=>/*#__PURE__*/ _react.default.createElement(Loading, {
            error: null,
            isLoading: true,
            pastDelay: false,
            timedOut: false
        });
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=dynamic.js.map


/***/ }),

/***/ 152:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(638)


/***/ })

};
;