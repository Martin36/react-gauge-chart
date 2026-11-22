"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderChart = void 0;
var _d = require("d3");
var _utils = require("./utils");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) { n[e] = r[e]; } return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0) { ; } } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
//Renders the chart, should be called every time the window is resized
var renderChart = exports.renderChart = function renderChart(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData) {
  // Without a DOM element to draw in (e.g. react-test-renderer or an
  // unmounted chart) there is nothing to measure or draw (#85)
  if (!container.current || !container.current.node || !container.current.node()) {
    return;
  }
  (0, _utils.updateDimensions)(props, container, margin, width, height);
  //Set dimensions of svg element and translations
  svg.current.attr("width", width.current + margin.current.left + margin.current.right).attr("height", height.current + margin.current.top + margin.current.bottom);
  g.current.attr("transform", "translate(" + margin.current.left + ", " + margin.current.top + ")");
  //Set the radius to lesser of width or height and remove the margins
  //Calculate the new radius
  (0, _utils.calculateRadius)(width, height, outerRadius, margin, g);
  doughnut.current.attr("transform", "translate(" + outerRadius.current + ", " + outerRadius.current + ")");
  //Setup the arc
  arcChart.current.outerRadius(outerRadius.current).innerRadius(outerRadius.current * (1 - props.arcWidth)).cornerRadius(props.cornerRadius).padAngle(props.arcPadding);
  //Remove the old stuff
  doughnut.current.selectAll(".arc").remove();
  g.current.selectAll(".text-group").remove();
  //Draw the arc
  var arcPaths = doughnut.current.selectAll(".arc").data(pieChart.current(arcData.current)).enter().append("g").attr("class", "arc");
  arcPaths.append("path").attr("d", arcChart.current).style("fill", function (d) {
    return d.data.color;
  });
  //Show the arc's label as a tooltip on hover
  if (Array.isArray(props.arcLabels)) {
    arcPaths.each(function (d, i) {
      var label = props.arcLabels[i];
      if (label !== undefined && label !== null && label !== "") {
        (0, _d.select)(this).append("title").text(label);
      }
    });
  }
  //With showArcLabels, also write each arc's label on the arc itself (#43).
  //font-size and fill are attributes, so a .arc-label CSS rule can override them
  if (props.showArcLabels && Array.isArray(props.arcLabels)) {
    var fontSize = Math.max(8, outerRadius.current * props.arcWidth * 0.35);
    arcPaths.each(function (d, i) {
      var label = props.arcLabels[i];
      if (label === undefined || label === null || label === "") return;
      var _arcChart$current$cen = arcChart.current.centroid(d),
        _arcChart$current$cen2 = _slicedToArray(_arcChart$current$cen, 2),
        x = _arcChart$current$cen2[0],
        y = _arcChart$current$cen2[1];
      (0, _d.select)(this).append("text").attr("class", "arc-label").attr("x", x).attr("y", y).attr("text-anchor", "middle").attr("dominant-baseline", "central").attr("font-size", "".concat(fontSize, "px")).attr("fill", props.textColor).style("pointer-events", "none").text(label);
    });
  }
  (0, _utils.drawReferenceLines)(props, doughnut, outerRadius, width);
};