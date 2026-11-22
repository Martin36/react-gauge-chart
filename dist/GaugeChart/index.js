"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _d = require("d3");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _utils = require("./utils");
var _renderChart = require("./renderChart");
var _drawNeedle = require("./drawNeedle");
var _customHooks = _interopRequireDefault(require("./customHooks"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) { "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); } return f; })(e, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*
GaugeChart creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
*/

//Constants
var startAngle = -Math.PI / 2; //Negative x-axis
var endAngle = Math.PI / 2; //Positive x-axis

var defaultStyle = {
  width: "100%"
};

// Props that should cause an animation on update
var animateNeedleProps = ["marginInPercent", "arcPadding", "percent", "nrOfLevels", "animDelay"];
var defaultProps = {
  style: defaultStyle,
  marginInPercent: 0.05,
  cornerRadius: 6,
  nrOfLevels: 3,
  percent: 0.4,
  arcPadding: 0.05,
  //The padding between arcs, in rad
  arcWidth: 0.2,
  //The width of the arc given in percent of the radius
  colors: ["#00FF00", "#FF0000"],
  //Default defined colors
  textColor: "#fff",
  needleColor: "#464A4F",
  needleBaseColor: "#464A4F",
  hideText: false,
  animate: true,
  animDelay: 500,
  formatTextValue: null,
  fontSize: null,
  clampNeedle: false,
  animateDuration: 3000,
  textComponent: undefined,
  needleScale: 0.55,
  showArcLabels: false,
  customNeedleComponent: null
};
var GaugeChart = function GaugeChart(initialProps) {
  var props = (0, _react.useMemo)(function () {
    return _objectSpread(_objectSpread({}, defaultProps), initialProps);
  }, [initialProps]);
  var svg = (0, _react.useRef)({});
  var g = (0, _react.useRef)({});
  var width = (0, _react.useRef)({});
  var height = (0, _react.useRef)({});
  var doughnut = (0, _react.useRef)({});
  var needle = (0, _react.useRef)({});
  var outerRadius = (0, _react.useRef)({});
  var margin = (0, _react.useRef)({}); // = {top: 20, right: 50, bottom: 50, left: 50},
  var container = (0, _react.useRef)({});
  var nbArcsToDisplay = (0, _react.useRef)(0);
  var colorArray = (0, _react.useRef)([]);
  var arcChart = (0, _react.useRef)((0, _d.arc)());
  var arcData = (0, _react.useRef)([]);
  var pieChart = (0, _react.useRef)((0, _d.pie)());
  var prevProps = (0, _react.useRef)(props);
  var selectedRef = (0, _react.useRef)({});
  var initChart = (0, _react.useCallback)(function (update) {
    var resize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var prevProps = arguments.length > 2 ? arguments[2] : undefined;
    if (update) {
      (0, _renderChart.renderChart)(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData);
      !customNeedleComponent && (0, _drawNeedle.drawNeedle)(resize, prevProps, props, width, needle, container, outerRadius, g);
      return;
    }
    container.current.select("svg").remove();
    svg.current = container.current.append("svg");
    g.current = svg.current.append("g"); //Used for margins
    doughnut.current = g.current.append("g").attr("class", "doughnut");

    //Set up the pie generator
    //Each arc should be of equal length (or should they?)
    pieChart.current.value(function (d) {
      return d.value;
    })
    //.padAngle(arcPadding)
    .startAngle(startAngle).endAngle(endAngle).sort(null);
    //Add the needle element
    needle.current = g.current.append("g").attr("class", "needle");
    (0, _renderChart.renderChart)(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData);
    !customNeedleComponent && (0, _drawNeedle.drawNeedle)(resize, prevProps, props, width, needle, container, outerRadius, g);
  }, [props]);

  // What a re-render used to do: rebuild the svg, then draw the update on it.
  // The rebuild no longer animates, so the needle keeps going from where it
  // was instead of restarting from 0 (#81).
  var redraw = function redraw(resize) {
    initChart(false, true, prevProps.current);
    initChart(true, resize, prevProps.current);
  };

  // Create the chart once, on mount. Later prop changes redraw it through the
  // effect below, so a parent re-render no longer rebuilds the chart and
  // restarts the needle from 0 (#81, #112).
  (0, _react.useLayoutEffect)(function () {
    (0, _utils.setArcData)(props, nbArcsToDisplay, colorArray, arcData);
    container.current = (0, _d.select)(selectedRef);
    //Initialize chart
    initChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  var lastWidth = (0, _react.useRef)(null);
  // Every prop that changes the drawing. Functions (often inline, so new on
  // every render) and React elements (rendered by React itself) are left out;
  // the effect after this one keeps the texts of the functions up to date.
  var drawingProps = {};
  Object.keys(props).forEach(function (key) {
    var value = props[key];
    if (typeof value === "function") {
      if (key === "needleTooltip") drawingProps[key] = true;
    } else if (! /*#__PURE__*/_react["default"].isValidElement(value)) {
      drawingProps[key] = value;
    }
  });
  (0, _customHooks["default"])(function () {
    if (props.nrOfLevels || prevProps.current.arcsLength.every(function (a) {
      return props.arcsLength.includes(a);
    }) || prevProps.current.colors.every(function (a) {
      return props.colors.includes(a);
    })) {
      (0, _utils.setArcData)(props, nbArcsToDisplay, colorArray, arcData);
    }
    //Initialize chart
    // Always redraw the chart, but potentially do not animate it
    var resize = !animateNeedleProps.some(function (key) {
      return prevProps.current[key] !== props[key];
    });
    redraw(resize);
    prevProps.current = props;
  }, [drawingProps]);

  // Function props (formatTextValue, needleTooltip) are often written inline,
  // so they are new on every render. Redrawing for them would interrupt the
  // needle animation, so only the texts they produce are refreshed.
  (0, _react.useEffect)(function () {
    if (!container.current || !container.current.select) return;
    // A re-render used to rebuild the chart, which also picked up a new
    // container width (e.g. a resized parent). Keep that: redraw without
    // animation when the width has changed since the last draw.
    var node = container.current.node && container.current.node();
    if (node && node.getBoundingClientRect) {
      var divWidth = node.getBoundingClientRect().width;
      if (lastWidth.current !== null && Math.abs(divWidth - lastWidth.current) > 0.5) {
        lastWidth.current = divWidth;
        redraw(true);
        return;
      }
      lastWidth.current = divWidth;
    }
    if (!props.hideText && !props.textComponent) {
      var text = (0, _utils.formatValue)(props.percent, props);
      var textNode = container.current.select(".text-group text");
      // The text is sized to fit, so a different text needs a redraw
      if (!textNode.empty() && textNode.text() !== String(text)) {
        redraw(true);
        return;
      }
    }
    if (typeof props.needleTooltip === "function") {
      var title = container.current.select(".needle title");
      var tooltip = props.needleTooltip(props.percent);
      if (!title.empty() && title.text() !== String(tooltip)) title.text(tooltip);
    }
  });

  // The latest window-resize handler, for the ResizeObserver below
  var handleResizeRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    // Redraw the same way as a mount or a props update, on a fresh svg, so a
    // resized chart has the same size as one first drawn at that width. The
    // old in-place resize measured the container while it still held the
    // previous svg, so the chart came out smaller after shrinking (larger
    // after growing) and jumped back on the next props update (#27).
    var handleResize = function handleResize() {
      var node = container.current && container.current.node && container.current.node();
      if (!node) return;
      var divWidth = node.getBoundingClientRect().width;
      // A hidden container (display: none, a closed tab) measures 0 wide:
      // keep the current drawing and redraw once it is visible again
      if (divWidth <= 0) return;
      // Nothing to do when the width is unchanged (e.g. only the height of the
      // window changed, or the chart's own height changed)
      var svgNode = container.current.select("svg").node();
      var drawnWidth = svgNode ? parseFloat(svgNode.getAttribute("width")) : NaN;
      if (Math.abs(divWidth - drawnWidth) <= 0.5) return;
      lastWidth.current = divWidth;
      redraw(true);
    };
    handleResizeRef.current = handleResize;
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return function () {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  // Also follow the container's own width, not only the window's (#27).
  // A parent that changes width without a window resize (a sidebar, a tab,
  // a grid column, a scrollbar appearing) used to leave the chart at its old
  // size until the next props update, which then resized every chart at once.
  (0, _react.useEffect)(function () {
    var node = container.current && container.current.node && container.current.node();
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    var frame = null;
    var check = function check() {
      frame = null;
      if (handleResizeRef.current) handleResizeRef.current();
    };
    var observer = new ResizeObserver(function () {
      // Wait a frame: avoids "ResizeObserver loop" warnings and merges bursts
      if (frame === null) frame = requestAnimationFrame(check);
    });
    observer.observe(node);
    return function () {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  var id = props.id,
    style = props.style,
    className = props.className,
    textComponent = props.textComponent,
    textComponentContainerClassName = props.textComponentContainerClassName,
    customNeedleComponent = props.customNeedleComponent,
    customNeedleStyle = props.customNeedleStyle,
    customNeedleComponentClassName = props.customNeedleComponentClassName;
  return /*#__PURE__*/_react["default"].createElement("div", {
    id: id,
    className: className,
    style: style
  }, /*#__PURE__*/_react["default"].createElement("div", {
    ref: function ref(svg) {
      return selectedRef = svg;
    }
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: textComponentContainerClassName,
    style: {
      position: "relative",
      top: "50%"
    }
  }, textComponent)), customNeedleComponent && /*#__PURE__*/_react["default"].createElement("div", {
    className: customNeedleComponentClassName,
    style: _objectSpread({
      position: "relative"
    }, customNeedleStyle)
  }, customNeedleComponent));
};
var _default = exports["default"] = GaugeChart;
GaugeChart.propTypes = {
  id: _propTypes["default"].string,
  className: _propTypes["default"].string,
  style: _propTypes["default"].object,
  marginInPercent: _propTypes["default"].number,
  cornerRadius: _propTypes["default"].number,
  nrOfLevels: _propTypes["default"].number,
  percent: _propTypes["default"].number,
  arcPadding: _propTypes["default"].number,
  arcWidth: _propTypes["default"].number,
  arcsLength: _propTypes["default"].array,
  colors: _propTypes["default"].array,
  textColor: _propTypes["default"].string,
  needleColor: _propTypes["default"].string,
  needleBaseColor: _propTypes["default"].string,
  hideText: _propTypes["default"].bool,
  animate: _propTypes["default"].bool,
  formatTextValue: _propTypes["default"].func,
  clampNeedle: _propTypes["default"].bool,
  fontSize: _propTypes["default"].string,
  animateDuration: _propTypes["default"].number,
  animDelay: _propTypes["default"].number,
  textComponent: _propTypes["default"].element,
  textComponentContainerClassName: _propTypes["default"].string,
  needleScale: _propTypes["default"].number,
  customNeedleComponent: _propTypes["default"].element,
  customNeedleComponentClassName: _propTypes["default"].string,
  customNeedleStyle: _propTypes["default"].object,
  showArcLabels: _propTypes["default"].bool,
  arcLabels: _propTypes["default"].arrayOf(_propTypes["default"].string),
  needleTooltip: _propTypes["default"].oneOfType([_propTypes["default"].bool, _propTypes["default"].func]),
  referenceLines: _propTypes["default"].arrayOf(_propTypes["default"].shape({
    percent: _propTypes["default"].number.isRequired,
    label: _propTypes["default"].node,
    color: _propTypes["default"].string,
    width: _propTypes["default"].number
  }))
};