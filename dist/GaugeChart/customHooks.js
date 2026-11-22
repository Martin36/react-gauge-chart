"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = require("react");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Deep equality for the dependency values used by GaugeChart (numbers,
// strings and arrays of them). It replaces lodash/isEqual, which was imported
// here but is not a dependency of this package, so apps without lodash failed
// to build with "Can't resolve 'lodash/isEqual'" (#122).
var isDeepEquals = function isDeepEquals(a, b) {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every(function (item, i) {
      return isDeepEquals(item, b[i]);
    });
  }
  if (a && b && _typeof(a) === "object" && _typeof(b) === "object") {
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    return keysA.length === keysB.length && keysA.every(function (key) {
      return Object.prototype.hasOwnProperty.call(b, key) && isDeepEquals(a[key], b[key]);
    });
  }
  return false;
};

// Returns the same array as long as the dependencies are deeply equal to the
// previous ones, so the effect below only runs when one of them changes
var useDeepCompareMemo = function useDeepCompareMemo(dependencies) {
  var ref = (0, _react.useRef)(null);
  if (!isDeepEquals(dependencies, ref.current)) {
    ref.current = dependencies;
  }
  return ref.current;
};

// this function compares deeply new dependencies with old one
// It works like useEffect but compares the dependencies deeply
var useDeepCompareEffect = function useDeepCompareEffect(callback, dependencies) {
  // The callback is usually a new function on every render, so it is left out
  // of the dependencies: only a deep change in `dependencies` runs the effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  (0, _react.useEffect)(callback, useDeepCompareMemo(dependencies));
};
var _default = exports["default"] = useDeepCompareEffect;