"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawNeedle = void 0;

var _d = require("d3");

var _utils = require("./utils");

//If 'resize' is true then the animation does not play
var drawNeedle = function drawNeedle(resize, prevProps, props, width, needle, container, outerRadius, g) {
  var percent = props.percent,
      needleColor = props.needleColor,
      needleBaseColor = props.needleBaseColor,
      hideText = props.hideText,
      animate = props.animate,
      needleScale = props.needleScale,
      textComponent = props.textComponent;
  var needleRadius = 15 * (width.current / 500),
      // Make the needle radius responsive
  centerPoint = [0, -needleRadius / 2]; //Remove the old stuff

  needle.current.selectAll("*").remove(); //Translate the needle starting point to the middle of the arc

  needle.current.attr("transform", "translate(" + outerRadius.current + ", " + outerRadius.current + ")"); //Draw the triangle
  //let pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;

  var prevPercent = prevProps ? prevProps.percent : 0;
  var pathStr = (0, _utils.calculateRotation)(prevPercent || percent, outerRadius, width, needleScale);
  needle.current.append("path").attr("d", pathStr).attr("fill", needleColor); //Add a circle at the bottom of needle

  needle.current.append("circle").attr("cx", centerPoint[0]).attr("cy", centerPoint[1]).attr("r", needleRadius).attr("fill", needleBaseColor);

  if (!hideText && !textComponent) {
    (0, _utils.addText)(percent, props, outerRadius, width, g);
  } //Rotate the needle


  if (!resize && animate) {
    needle.current.transition().delay(props.animDelay).ease(_d.easeElastic).duration(props.animateDuration).tween("progress", function () {
      var currentPercent = (0, _d.interpolateNumber)(prevPercent, percent);
      return function (percentOfPercent) {
        var progress = currentPercent(percentOfPercent);
        return container.current.select(".needle path").attr("d", (0, _utils.calculateRotation)(progress, outerRadius, width, needleScale));
      };
    });
  } else {
    container.current.select(".needle path").attr("d", (0, _utils.calculateRotation)(percent, outerRadius, width, needleScale));
  }
};

exports.drawNeedle = drawNeedle;