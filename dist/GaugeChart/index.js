"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _d = require("d3");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("./utils");

var _renderChart = require("./renderChart");

var _drawNeedle = require("./drawNeedle");

var _customHooks = _interopRequireDefault(require("./customHooks"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
}; // Props that should cause an animation on update

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
  animateDuration: 3000,
  textComponent: undefined,
  needleScale: 0.55,
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

    doughnut.current = g.current.append("g").attr("class", "doughnut"); //Set up the pie generator
    //Each arc should be of equal length (or should they?)

    pieChart.current.value(function (d) {
      return d.value;
    }) //.padAngle(arcPadding)
    .startAngle(startAngle).endAngle(endAngle).sort(null); //Add the needle element

    needle.current = g.current.append("g").attr("class", "needle");
    (0, _renderChart.renderChart)(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData);
    !customNeedleComponent && (0, _drawNeedle.drawNeedle)(resize, prevProps, props, width, needle, container, outerRadius, g);
  }, [props]);
  (0, _react.useLayoutEffect)(function () {
    (0, _utils.setArcData)(props, nbArcsToDisplay, colorArray, arcData);
    container.current = (0, _d.select)(selectedRef); //Initialize chart

    initChart();
  }, [props, initChart]);
  (0, _customHooks.default)(function () {
    if (props.nrOfLevels || prevProps.current.arcsLength.every(function (a) {
      return props.arcsLength.includes(a);
    }) || prevProps.current.colors.every(function (a) {
      return props.colors.includes(a);
    })) {
      (0, _utils.setArcData)(props, nbArcsToDisplay, colorArray, arcData);
    } //Initialize chart
    // Always redraw the chart, but potentially do not animate it


    var resize = !animateNeedleProps.some(function (key) {
      return prevProps.current[key] !== props[key];
    });
    initChart(true, resize, prevProps.current);
    prevProps.current = props;
  }, [props.nrOfLevels, props.arcsLength, props.colors, props.percent, props.needleColor, props.needleBaseColor]);
  (0, _react.useEffect)(function () {
    var handleResize = function handleResize() {
      var resize = true;
      (0, _renderChart.renderChart)(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData);
      !customNeedleComponent && (0, _drawNeedle.drawNeedle)(resize, prevProps, props, width, needle, container, outerRadius, g);
    }; //Set up resize event listener to re-render the chart everytime the window is resized


    window.addEventListener("resize", handleResize);
    return function () {
      window.removeEventListener("resize", handleResize);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);
  var id = props.id,
      style = props.style,
      className = props.className,
      textComponent = props.textComponent,
      textComponentContainerClassName = props.textComponentContainerClassName,
      customNeedleComponent = props.customNeedleComponent,
      customNeedleStyle = props.customNeedleStyle,
      customNeedleComponentClassName = props.customNeedleComponentClassName;
  return /*#__PURE__*/_react.default.createElement("div", {
    id: id,
    className: className,
    style: style
  }, /*#__PURE__*/_react.default.createElement("div", {
    ref: function ref(svg) {
      return selectedRef = svg;
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: textComponentContainerClassName,
    style: {
      position: "relative",
      top: "50%"
    }
  }, textComponent)), customNeedleComponent && /*#__PURE__*/_react.default.createElement("div", {
    className: customNeedleComponentClassName,
    style: _objectSpread({
      position: "relative"
    }, customNeedleStyle)
  }, customNeedleComponent));
};

var _default = GaugeChart;
exports.default = _default;
GaugeChart.propTypes = {
  id: _propTypes.default.string,
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  marginInPercent: _propTypes.default.number,
  cornerRadius: _propTypes.default.number,
  nrOfLevels: _propTypes.default.number,
  percent: _propTypes.default.number,
  arcPadding: _propTypes.default.number,
  arcWidth: _propTypes.default.number,
  arcsLength: _propTypes.default.array,
  colors: _propTypes.default.array,
  textColor: _propTypes.default.string,
  needleColor: _propTypes.default.string,
  needleBaseColor: _propTypes.default.string,
  hideText: _propTypes.default.bool,
  animate: _propTypes.default.bool,
  formatTextValue: _propTypes.default.func,
  fontSize: _propTypes.default.string,
  animateDuration: _propTypes.default.number,
  animDelay: _propTypes.default.number,
  textComponent: _propTypes.default.element,
  textComponentContainerClassName: _propTypes.default.string,
  needleScale: _propTypes.default.number,
  customNeedleComponent: _propTypes.default.element,
  customNeedleComponentClassName: _propTypes.default.string,
  customNeedleStyle: _propTypes.default.object
};