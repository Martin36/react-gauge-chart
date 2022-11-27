"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isEqual = _interopRequireDefault(require("lodash/isEqual"));

var _react = require("react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isDeepEquals = function isDeepEquals(toCompare, reference) {
  return (0, _isEqual.default)(toCompare, reference);
};

var useDeepCompareMemo = function useDeepCompareMemo(dependencies) {
  var ref = (0, _react.useRef)(null);

  if (isDeepEquals(dependencies, ref.current)) {
    ref.current = dependencies;
  }

  return ref.current;
}; // this function compares deeply new dependencies with old one
// It works like useEffect but we are using isEqual from lodash to compares deeply


var useDeepCompareEffect = function useDeepCompareEffect(callback, dependencies) {
  (0, _react.useEffect)(callback, [useDeepCompareMemo(dependencies), callback]);
};

var _default = useDeepCompareEffect;
exports.default = _default;