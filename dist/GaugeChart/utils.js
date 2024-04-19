"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setArcData = exports.addText = exports.calculateRotation = exports.updateDimensions = exports.centerGraph = exports.calculateRadius = void 0;

var _d = require("d3");

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


exports.calculateRadius = calculateRadius;

var centerGraph = function centerGraph(width, g, outerRadius, margin) {
  margin.current.left = width.current / 2 - outerRadius.current + margin.current.right;
  g.current.attr("transform", "translate(" + margin.current.left + ", " + margin.current.top + ")");
};

exports.centerGraph = centerGraph;

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

exports.updateDimensions = updateDimensions;

var calculateRotation = function calculateRotation(percent, outerRadius, width, needleScale) {
  var needleLength = outerRadius.current * needleScale,
      //TODO: Maybe it should be specified as a percentage of the arc radius?
  needleRadius = 15 * (width.current / 500),
      theta = percentToRad(percent),
      centerPoint = [0, -needleRadius / 2],
      topPoint = [centerPoint[0] - needleLength * Math.cos(theta), centerPoint[1] - needleLength * Math.sin(theta)],
      leftPoint = [centerPoint[0] - needleRadius * Math.cos(theta - Math.PI / 2), centerPoint[1] - needleRadius * Math.sin(theta - Math.PI / 2)],
      rightPoint = [centerPoint[0] - needleRadius * Math.cos(theta + Math.PI / 2), centerPoint[1] - needleRadius * Math.sin(theta + Math.PI / 2)];
  var pathStr = "M ".concat(leftPoint[0], " ").concat(leftPoint[1], " L ").concat(topPoint[0], " ").concat(topPoint[1], " L ").concat(rightPoint[0], " ").concat(rightPoint[1]);
  return pathStr;
}; //Adds text undeneath the graft to display which percentage is the current one


exports.calculateRotation = calculateRotation;

var addText = function addText(percentage, props, outerRadius, width, g) {
  var formatTextValue = props.formatTextValue,
      fontSize = props.fontSize;
  var textPadding = 20;
  var text = formatTextValue ? formatTextValue(floatingNumber(percentage)) : floatingNumber(percentage) + "%";
  g.current.append("g").attr("class", "text-group").attr("transform", "translate(".concat(outerRadius.current, ", ").concat(outerRadius.current / 2 + textPadding, ")")).append("text").text(text) // this computation avoid text overflow. When formatted value is over 10 characters, we should reduce font size
  .style("font-size", function () {
    return fontSize ? fontSize : "".concat(width.current / 11 / (text.length > 10 ? text.length / 10 : 1), "px");
  }).style("fill", props.textColor).style("text-anchor", "middle");
}; // This function update arc's datas when component is mounting or when one of arc's props is updated


exports.addText = addText;

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
}; //Depending on the number of levels in the chart
//This function returns the same number of colors


exports.setArcData = setArcData;

var getColors = function getColors(props, nbArcsToDisplay) {
  var colors = props.colors;
  var colorScale = (0, _d.scaleLinear)().domain([1, nbArcsToDisplay.current]).range([colors[0], colors[colors.length - 1]]) //Use the first and the last color as range
  .interpolate(_d.interpolateHsl);
  var colorArray = [];

  for (var i = 1; i <= nbArcsToDisplay.current; i++) {
    colorArray.push(colorScale(i));
  }

  return colorArray;
};

var floatingNumber = function floatingNumber(value) {
  var maxDigits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  return Math.round(value * 100 * Math.pow(10, maxDigits)) / Math.pow(10, maxDigits);
}; //Returns the angle (in rad) for the given 'percent' value where percent = 1 means 100% and is 180 degree angle


var percentToRad = function percentToRad(percent) {
  return percent * Math.PI;
};