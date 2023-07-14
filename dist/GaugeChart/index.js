"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _d = require("d3");

var _propTypes = _interopRequireDefault(require("prop-types"));

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
  animateDuration: 3000
};

var GaugeChart = function GaugeChart(props) {
  props = _objectSpread(_objectSpread({}, defaultProps), props);
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
      renderChart(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData);
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
    renderChart(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData);
  }, [props]);
  (0, _react.useLayoutEffect)(function () {
    setArcData(props, nbArcsToDisplay, colorArray, arcData);
    container.current = (0, _d.select)(selectedRef); //Initialize chart

    initChart();
  }, [props, initChart]);
  (0, _customHooks.default)(function () {
    if (props.nrOfLevels || prevProps.current.arcsLength.every(function (a) {
      return props.arcsLength.includes(a);
    }) || prevProps.current.colors.every(function (a) {
      return props.colors.includes(a);
    })) {
      setArcData(props, nbArcsToDisplay, colorArray, arcData);
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
      renderChart(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData);
    }; //Set up resize event listener to re-render the chart everytime the window is resized


    window.addEventListener("resize", handleResize);
    return function () {
      window.removeEventListener("resize", handleResize);
    };
  }, [props]);
  var _props = props,
      id = _props.id,
      style = _props.style,
      className = _props.className;
  return /*#__PURE__*/_react.default.createElement("div", {
    id: id,
    className: className,
    style: style,
    ref: function ref(svg) {
      return selectedRef = svg;
    }
  });
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
  animDelay: _propTypes.default.number
}; // This function update arc's datas when component is mounting or when one of arc's props is updated

var setArcData = function setArcData(props, nbArcsToDisplay, colorArray, arcData) {
  // We have to make a decision about number of arcs to display
  // If arcsLength is setted, we choose arcsLength length instead of nrOfLevels
  nbArcsToDisplay.current = props.arcsLength ? props.arcsLength.length : props.nrOfLevels; //Check if the number of colors equals the number of levels
  //Otherwise make an interpolation

  if (nbArcsToDisplay.current === props.colors.length) {
    colorArray.current = props.colors;
  } else {
    colorArray.current = getColors(props, nbArcsToDisplay);
  } //The data that is used to create the arc
  // Each arc could have hiw own value width arcsLength prop


  arcData.current = [];

  for (var i = 0; i < nbArcsToDisplay.current; i++) {
    var arcDatum = {
      value: props.arcsLength && props.arcsLength.length > i ? props.arcsLength[i] : 1,
      color: colorArray.current[i]
    };
    arcData.current.push(arcDatum);
  }
}; //Renders the chart, should be called every time the window is resized


var renderChart = function renderChart(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData) {
  updateDimensions(props, container, margin, width, height); //Set dimensions of svg element and translations

  svg.current.attr("width", width.current + margin.current.left + margin.current.right).attr("height", height.current + margin.current.top + margin.current.bottom);
  g.current.attr("transform", "translate(" + margin.current.left + ", " + margin.current.top + ")"); //Set the radius to lesser of width or height and remove the margins
  //Calculate the new radius

  calculateRadius(width, height, outerRadius, margin, g);
  doughnut.current.attr("transform", "translate(" + outerRadius.current + ", " + outerRadius.current + ")"); //Setup the arc

  arcChart.current.outerRadius(outerRadius.current).innerRadius(outerRadius.current * (1 - props.arcWidth)).cornerRadius(props.cornerRadius).padAngle(props.arcPadding); //Remove the old stuff

  doughnut.current.selectAll(".arc").remove();
  needle.current.selectAll("*").remove();
  g.current.selectAll(".text-group").remove(); //Draw the arc

  var arcPaths = doughnut.current.selectAll(".arc").data(pieChart.current(arcData.current)).enter().append("g").attr("class", "arc");
  arcPaths.append("path").attr("d", arcChart.current).style("fill", function (d) {
    return d.data.color;
  });
  drawNeedle(resize, prevProps, props, width, needle, container, outerRadius, g); //Translate the needle starting point to the middle of the arc

  needle.current.attr("transform", "translate(" + outerRadius.current + ", " + outerRadius.current + ")");
}; //Depending on the number of levels in the chart
//This function returns the same number of colors


var getColors = function getColors(props, nbArcsToDisplay) {
  var colors = props.colors;
  var colorScale = (0, _d.scaleLinear)().domain([1, nbArcsToDisplay.current]).range([colors[0], colors[colors.length - 1]]) //Use the first and the last color as range
  .interpolate(_d.interpolateHsl);
  var colorArray = [];

  for (var i = 1; i <= nbArcsToDisplay.current; i++) {
    colorArray.push(colorScale(i));
  }

  return colorArray;
}; //If 'resize' is true then the animation does not play


var drawNeedle = function drawNeedle(resize, prevProps, props, width, needle, container, outerRadius, g) {
  var percent = props.percent,
      needleColor = props.needleColor,
      needleBaseColor = props.needleBaseColor,
      hideText = props.hideText,
      animate = props.animate;
  var needleRadius = 15 * (width.current / 500),
      // Make the needle radius responsive
  centerPoint = [0, -needleRadius / 2]; //Draw the triangle
  //var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;

  var prevPercent = prevProps ? prevProps.percent : 0;
  var pathStr = calculateRotation(prevPercent || percent, outerRadius, width);
  needle.current.append("path").attr("d", pathStr).attr("fill", needleColor); //Add a circle at the bottom of needle

  needle.current.append("circle").attr("cx", centerPoint[0]).attr("cy", centerPoint[1]).attr("r", needleRadius).attr("fill", needleBaseColor);

  if (!hideText) {
    addText(percent, props, outerRadius, width, g);
  } //Rotate the needle


  if (!resize && animate) {
    needle.current.transition().delay(props.animDelay).ease(_d.easeElastic).duration(props.animateDuration).tween("progress", function () {
      var currentPercent = (0, _d.interpolateNumber)(prevPercent, percent);
      return function (percentOfPercent) {
        var progress = currentPercent(percentOfPercent);
        return container.current.select(".needle path").attr("d", calculateRotation(progress, outerRadius, width));
      };
    });
  } else {
    container.current.select(".needle path").attr("d", calculateRotation(percent, outerRadius, width));
  }
};

var calculateRotation = function calculateRotation(percent, outerRadius, width) {
  var needleLength = outerRadius.current * 0.55,
      //TODO: Maybe it should be specified as a percentage of the arc radius?
  needleRadius = 15 * (width.current / 500),
      theta = percentToRad(percent),
      centerPoint = [0, -needleRadius / 2],
      topPoint = [centerPoint[0] - needleLength * Math.cos(theta), centerPoint[1] - needleLength * Math.sin(theta)],
      leftPoint = [centerPoint[0] - needleRadius * Math.cos(theta - Math.PI / 2), centerPoint[1] - needleRadius * Math.sin(theta - Math.PI / 2)],
      rightPoint = [centerPoint[0] - needleRadius * Math.cos(theta + Math.PI / 2), centerPoint[1] - needleRadius * Math.sin(theta + Math.PI / 2)];
  var pathStr = "M ".concat(leftPoint[0], " ").concat(leftPoint[1], " L ").concat(topPoint[0], " ").concat(topPoint[1], " L ").concat(rightPoint[0], " ").concat(rightPoint[1]);
  return pathStr;
}; //Returns the angle (in rad) for the given 'percent' value where percent = 1 means 100% and is 180 degree angle


var percentToRad = function percentToRad(percent) {
  return percent * Math.PI;
}; //Adds text undeneath the graft to display which percentage is the current one


var addText = function addText(percentage, props, outerRadius, width, g) {
  var formatTextValue = props.formatTextValue,
      fontSize = props.fontSize;
  var textPadding = 20;
  var text = formatTextValue ? formatTextValue(floatingNumber(percentage)) : floatingNumber(percentage) + "%";
  g.current.append("g").attr("class", "text-group").attr("transform", "translate(".concat(outerRadius.current, ", ").concat(outerRadius.current / 2 + textPadding, ")")).append("text").text(text) // this computation avoid text overflow. When formatted value is over 10 characters, we should reduce font size
  .style("font-size", function () {
    return fontSize ? fontSize : "".concat(width.current / 11 / (text.length > 10 ? text.length / 10 : 1), "px");
  }).style("fill", props.textColor).style("text-anchor", "middle");
};

var floatingNumber = function floatingNumber(value) {
  var maxDigits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  return Math.round(value * 100 * Math.pow(10, maxDigits)) / Math.pow(10, maxDigits);
};

var calculateRadius = function calculateRadius(width, height, outerRadius, margin, g) {
  //The radius needs to be constrained by the containing div
  //Since it is a half circle we are dealing with the height of the div
  //Only needs to be half of the width, because the width needs to be 2 * radius
  //For the whole arc to fit
  //First check if it is the width or the height that is the "limiting" dimension
  if (width.current < 2 * height.current) {
    //Then the width limits the size of the chart
    //Set the radius to the width - the horizontal margins
    outerRadius.current = (width.current - margin.current.left - margin.current.right) / 2;
  } else {
    outerRadius.current = height.current - margin.current.top - margin.current.bottom;
  }

  centerGraph(width, g, outerRadius, margin);
}; //Calculates new margins to make the graph centered


var centerGraph = function centerGraph(width, g, outerRadius, margin) {
  margin.current.left = width.current / 2 - outerRadius.current + margin.current.right;
  g.current.attr("transform", "translate(" + margin.current.left + ", " + margin.current.top + ")");
};

var updateDimensions = function updateDimensions(props, container, margin, width, height) {
  //TODO: Fix so that the container is included in the component
  var marginInPercent = props.marginInPercent;
  var divDimensions = container.current.node().getBoundingClientRect(),
      divWidth = divDimensions.width,
      divHeight = divDimensions.height; //Set the new width and horizontal margins

  margin.current.left = divWidth * marginInPercent;
  margin.current.right = divWidth * marginInPercent;
  width.current = divWidth - margin.current.left - margin.current.right;
  margin.current.top = divHeight * marginInPercent;
  margin.current.bottom = divHeight * marginInPercent;
  height.current = width.current / 2 - margin.current.top - margin.current.bottom; //height.current = divHeight - margin.current.top - margin.current.bottom;
};