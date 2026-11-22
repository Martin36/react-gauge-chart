"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawNeedle = void 0;
var _d = require("d3");
var _utils = require("./utils");
//If 'resize' is true then the animation does not play
var drawNeedle = exports.drawNeedle = function drawNeedle(resize, prevProps, props, width, needle, container, outerRadius, g) {
  var percent = props.percent,
    needleColor = props.needleColor,
    needleBaseColor = props.needleBaseColor,
    hideText = props.hideText,
    animate = props.animate,
    needleScale = props.needleScale,
    textComponent = props.textComponent;
  var needleRadius = 15 * (width.current / 500),
    // Make the needle radius responsive
    centerPoint = [0, -needleRadius / 2];

  //Remove the old stuff
  needle.current.selectAll("*").remove();

  //Translate the needle starting point to the middle of the arc
  needle.current.attr("transform", "translate(" + outerRadius.current + ", " + outerRadius.current + ")");

  //Draw the triangle
  //let pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
  // With clampNeedle the needle stops at the ends of the arc for values
  // below 0 or above 1 (#41); the text still shows the value as given
  var toNeedle = function toNeedle(value) {
    return props.clampNeedle ? Math.min(1, Math.max(0, value)) : value;
  };
  var prevPercent = prevProps ? prevProps.percent : 0;
  var willAnimate = !resize && animate;
  // Where the needle is drawn now. Before an animation (and during its
  // animDelay) it waits at its start value, which may be 0 (#112). A redraw
  // without animation keeps a running animation's current value, so the
  // needle doesn't jump to the end and back.
  var state = needleState(container);
  var keepsAnimation = resize && state && state.animating;
  if (state && !keepsAnimation) {
    // A new value: stop any older animation from moving the needle
    state.token += 1;
    state.animating = false;
  }
  var startValue = willAnimate ? prevPercent : keepsAnimation ? state.value : percent;
  var pathStr = (0, _utils.calculateRotation)(toNeedle(startValue), outerRadius, width, needleScale);
  needle.current.append("path").attr("d", pathStr).attr("fill", needleColor);
  //Add a circle at the bottom of needle
  needle.current.append("circle").attr("cx", centerPoint[0]).attr("cy", centerPoint[1]).attr("r", needleRadius).attr("fill", needleBaseColor);
  //Show the value as a tooltip when hovering the needle
  if (props.needleTooltip) {
    needle.current.append("title").text(typeof props.needleTooltip === "function" ? props.needleTooltip(percent) : (0, _utils.formatValue)(percent, props));
  }
  if (!hideText && !textComponent) {
    (0, _utils.addText)(percent, props, outerRadius, width, g);
  }
  //Rotate the needle
  if (willAnimate) {
    var token = state ? state.token : 0;
    if (state) {
      state.animating = true;
      state.value = prevPercent;
    }
    var done = function done() {
      if (state && state.token === token) state.animating = false;
    };
    needle.current.transition().delay(props.animDelay).ease(_d.easeElastic).duration(props.animateDuration).on("end", done).on("interrupt", done).tween("progress", function () {
      var currentPercent = (0, _d.interpolateNumber)(toNeedle(prevPercent), toNeedle(percent));
      return function (percentOfPercent) {
        var progress = currentPercent(percentOfPercent);
        if (state && state.token !== token) return;
        if (state) state.value = progress;
        return container.current.select(".needle path").attr("d", (0, _utils.calculateRotation)(progress, outerRadius, width, needleScale));
      };
    });
  } else {
    container.current.select(".needle path").attr("d", (0, _utils.calculateRotation)(toNeedle(startValue), outerRadius, width, needleScale));
  }
};

// Animation state of a gauge's needle, kept on its container element so it
// survives the svg being rebuilt
var needleState = function needleState(container) {
  var node = container.current && container.current.node && container.current.node();
  if (!node) return null;
  if (!node.__gaugeNeedle) {
    node.__gaugeNeedle = {
      animating: false,
      value: 0,
      token: 0
    };
  }
  return node.__gaugeNeedle;
};