"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderChart = void 0;

var _utils = require("./utils");

//Renders the chart, should be called every time the window is resized
var renderChart = function renderChart(resize, prevProps, width, margin, height, outerRadius, g, doughnut, arcChart, needle, pieChart, svg, props, container, arcData) {
  (0, _utils.updateDimensions)(props, container, margin, width, height); //Set dimensions of svg element and translations

  svg.current.attr("width", width.current + margin.current.left + margin.current.right).attr("height", height.current + margin.current.top + margin.current.bottom);
  g.current.attr("transform", "translate(" + margin.current.left + ", " + margin.current.top + ")"); //Set the radius to lesser of width or height and remove the margins
  //Calculate the new radius

  (0, _utils.calculateRadius)(width, height, outerRadius, margin, g);
  doughnut.current.attr("transform", "translate(" + outerRadius.current + ", " + outerRadius.current + ")"); //Setup the arc

  arcChart.current.outerRadius(outerRadius.current).innerRadius(outerRadius.current * (1 - props.arcWidth)).cornerRadius(props.cornerRadius).padAngle(props.arcPadding); //Remove the old stuff

  doughnut.current.selectAll(".arc").remove();
  g.current.selectAll(".text-group").remove(); //Draw the arc

  var arcPaths = doughnut.current.selectAll(".arc").data(pieChart.current(arcData.current)).enter().append("g").attr("class", "arc");
  arcPaths.append("path").attr("d", arcChart.current).style("fill", function (d) {
    return d.data.color;
  });
};

exports.renderChart = renderChart;