import React, { useCallback, useEffect, useRef, useLayoutEffect } from "react";
import {
  arc,
  pie,
  select,
  easeElastic,
  scaleLinear,
  interpolateHsl,
  interpolateNumber,
} from "d3";
import PropTypes from "prop-types";

import useDeepCompareEffect from "./customHooks";
/*
GaugeChart creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
*/

//Constants
const startAngle = -Math.PI / 2; //Negative x-axis
const endAngle = Math.PI / 2; //Positive x-axis

const defaultStyle = {
  width: "100%",
};

// Props that should cause an animation on update
const animateNeedleProps = [
  "marginInPercent",
  "arcPadding",
  "percent",
  "nrOfLevels",
  "animDelay",
];

const GaugeChart = (props) => {
  const svg = useRef({});
  const g = useRef({});
  const width = useRef({});
  const height = useRef({});
  const doughnut = useRef({});
  const needle = useRef({});
  const outerRadius = useRef({});
  const margin = useRef({}); // = {top: 20, right: 50, bottom: 50, left: 50},
  const container = useRef({});
  const nbArcsToDisplay = useRef(0);
  const colorArray = useRef([]);
  const arcChart = useRef(arc());
  const arcData = useRef([]);
  const pieChart = useRef(pie());
  const prevProps = useRef(props);
  let selectedRef = useRef({});

  const initChart = useCallback(
    (update, resize = false, prevProps) => {
      if (update) {
        renderChart(
          resize,
          prevProps,
          width,
          margin,
          height,
          outerRadius,
          g,
          doughnut,
          arcChart,
          needle,
          pieChart,
          svg,
          props,
          container,
          arcData
        );
        return;
      }

      container.current.select("svg").remove();
      svg.current = container.current.append("svg");
      g.current = svg.current.append("g"); //Used for margins
      doughnut.current = g.current.append("g").attr("class", "doughnut");

      //Set up the pie generator
      //Each arc should be of equal length (or should they?)
      pieChart.current
        .value(function (d) {
          return d.value;
        })
        //.padAngle(arcPadding)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .sort(null);
      //Add the needle element
      needle.current = g.current.append("g").attr("class", "needle");

      renderChart(
        resize,
        prevProps,
        width,
        margin,
        height,
        outerRadius,
        g,
        doughnut,
        arcChart,
        needle,
        pieChart,
        svg,
        props,
        container,
        arcData
      );
    },
    [props]
  );

  useLayoutEffect(() => {
    setArcData(props, nbArcsToDisplay, colorArray, arcData);
    container.current = select(selectedRef);
    //Initialize chart
    initChart();
  }, [props, initChart]);

  useDeepCompareEffect(() => {
    if (
      props.nrOfLevels ||
      prevProps.current.arcsLength.every((a) => props.arcsLength.includes(a)) ||
      prevProps.current.colors.every((a) => props.colors.includes(a))
    ) {
      setArcData(props, nbArcsToDisplay, colorArray, arcData);
    }
    //Initialize chart
    // Always redraw the chart, but potentially do not animate it
    const resize = !animateNeedleProps.some(
      (key) => prevProps.current[key] !== props[key]
    );
    initChart(true, resize, prevProps.current);
    prevProps.current = props;
  }, [
    props.nrOfLevels,
    props.arcsLength,
    props.colors,
    props.percent,
    props.needleColor,
    props.needleBaseColor,
  ]);

  useEffect(() => {
    const handleResize = () => {
      var resize = true;

      renderChart(
        resize,
        prevProps,
        width,
        margin,
        height,
        outerRadius,
        g,
        doughnut,
        arcChart,
        needle,
        pieChart,
        svg,
        props,
        container,
        arcData
      );
    };
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [props]);

  const { id, style, className } = props;
  return (
    <div
      id={id}
      className={className}
      style={style}
      ref={(svg) => (selectedRef = svg)}
    />
  );
};

export default GaugeChart;

GaugeChart.defaultProps = {
  style: defaultStyle,
  marginInPercent: 0.05,
  cornerRadius: 6,
  nrOfLevels: 3,
  percent: 0.4,
  arcPadding: 0.05, //The padding between arcs, in rad
  arcWidth: 0.2, //The width of the arc given in percent of the radius
  colors: ["#00FF00", "#FF0000"], //Default defined colors
  textColor: "#fff",
  needleColor: "#464A4F",
  needleBaseColor: "#464A4F",
  hideText: false,
  animate: true,
  animDelay: 500,
  formatTextValue: null,
  fontSize: null,
  animateDuration: 3000,
};

GaugeChart.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  marginInPercent: PropTypes.number,
  cornerRadius: PropTypes.number,
  nrOfLevels: PropTypes.number,
  percent: PropTypes.number,
  arcPadding: PropTypes.number,
  arcWidth: PropTypes.number,
  arcsLength: PropTypes.array,
  colors: PropTypes.array,
  textColor: PropTypes.string,
  needleColor: PropTypes.string,
  needleBaseColor: PropTypes.string,
  hideText: PropTypes.bool,
  animate: PropTypes.bool,
  formatTextValue: PropTypes.func,
  fontSize: PropTypes.string,
  animateDuration: PropTypes.number,
  animDelay: PropTypes.number,
};

// This function update arc's datas when component is mounting or when one of arc's props is updated
const setArcData = (props, nbArcsToDisplay, colorArray, arcData) => {
  // We have to make a decision about number of arcs to display
  // If arcsLength is setted, we choose arcsLength length instead of nrOfLevels
  nbArcsToDisplay.current = props.arcsLength
    ? props.arcsLength.length
    : props.nrOfLevels;

  //Check if the number of colors equals the number of levels
  //Otherwise make an interpolation
  if (nbArcsToDisplay.current === props.colors.length) {
    colorArray.current = props.colors;
  } else {
    colorArray.current = getColors(props, nbArcsToDisplay);
  }
  //The data that is used to create the arc
  // Each arc could have hiw own value width arcsLength prop
  arcData.current = [];
  for (var i = 0; i < nbArcsToDisplay.current; i++) {
    var arcDatum = {
      value:
        props.arcsLength && props.arcsLength.length > i
          ? props.arcsLength[i]
          : 1,
      color: colorArray.current[i],
    };
    arcData.current.push(arcDatum);
  }
};

//Renders the chart, should be called every time the window is resized
const renderChart = (
  resize,
  prevProps,
  width,
  margin,
  height,
  outerRadius,
  g,
  doughnut,
  arcChart,
  needle,
  pieChart,
  svg,
  props,
  container,
  arcData
) => {
  updateDimensions(props, container, margin, width, height);
  //Set dimensions of svg element and translations
  svg.current
    .attr("width", width.current + margin.current.left + margin.current.right)
    .attr(
      "height",
      height.current + margin.current.top + margin.current.bottom
    );
  g.current.attr(
    "transform",
    "translate(" + margin.current.left + ", " + margin.current.top + ")"
  );
  //Set the radius to lesser of width or height and remove the margins
  //Calculate the new radius
  calculateRadius(width, height, outerRadius, margin, g);
  doughnut.current.attr(
    "transform",
    "translate(" + outerRadius.current + ", " + outerRadius.current + ")"
  );
  //Setup the arc
  arcChart.current
    .outerRadius(outerRadius.current)
    .innerRadius(outerRadius.current * (1 - props.arcWidth))
    .cornerRadius(props.cornerRadius)
    .padAngle(props.arcPadding);
  //Remove the old stuff
  doughnut.current.selectAll(".arc").remove();
  needle.current.selectAll("*").remove();
  g.current.selectAll(".text-group").remove();
  //Draw the arc
  var arcPaths = doughnut.current
    .selectAll(".arc")
    .data(pieChart.current(arcData.current))
    .enter()
    .append("g")
    .attr("class", "arc");
  arcPaths
    .append("path")
    .attr("d", arcChart.current)
    .style("fill", function (d) {
      return d.data.color;
    });

  drawNeedle(
    resize,
    prevProps,
    props,
    width,
    needle,
    container,
    outerRadius,
    g
  );
  //Translate the needle starting point to the middle of the arc
  needle.current.attr(
    "transform",
    "translate(" + outerRadius.current + ", " + outerRadius.current + ")"
  );
};

//Depending on the number of levels in the chart
//This function returns the same number of colors
const getColors = (props, nbArcsToDisplay) => {
  const { colors } = props;
  var colorScale = scaleLinear()
    .domain([1, nbArcsToDisplay.current])
    .range([colors[0], colors[colors.length - 1]]) //Use the first and the last color as range
    .interpolate(interpolateHsl);
  var colorArray = [];
  for (var i = 1; i <= nbArcsToDisplay.current; i++) {
    colorArray.push(colorScale(i));
  }
  return colorArray;
};

//If 'resize' is true then the animation does not play
const drawNeedle = (
  resize,
  prevProps,
  props,
  width,
  needle,
  container,
  outerRadius,
  g
) => {
  const { percent, needleColor, needleBaseColor, hideText, animate } = props;
  var needleRadius = 15 * (width.current / 500), // Make the needle radius responsive
    centerPoint = [0, -needleRadius / 2];
  //Draw the triangle
  //var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
  const prevPercent = prevProps ? prevProps.percent : 0;
  var pathStr = calculateRotation(prevPercent || percent, outerRadius, width);
  needle.current.append("path").attr("d", pathStr).attr("fill", needleColor);
  //Add a circle at the bottom of needle
  needle.current
    .append("circle")
    .attr("cx", centerPoint[0])
    .attr("cy", centerPoint[1])
    .attr("r", needleRadius)
    .attr("fill", needleBaseColor);
  if (!hideText) {
    addText(percent, props, outerRadius, width, g);
  }
  //Rotate the needle
  if (!resize && animate) {
    needle.current
      .transition()
      .delay(props.animDelay)
      .ease(easeElastic)
      .duration(props.animateDuration)
      .tween("progress", function () {
        const currentPercent = interpolateNumber(prevPercent, percent);
        return function (percentOfPercent) {
          const progress = currentPercent(percentOfPercent);
          return container.current
            .select(`.needle path`)
            .attr("d", calculateRotation(progress, outerRadius, width));
        };
      });
  } else {
    container.current
      .select(`.needle path`)
      .attr("d", calculateRotation(percent, outerRadius, width));
  }
};

const calculateRotation = (percent, outerRadius, width) => {
  var needleLength = outerRadius.current * 0.55, //TODO: Maybe it should be specified as a percentage of the arc radius?
    needleRadius = 15 * (width.current / 500),
    theta = percentToRad(percent),
    centerPoint = [0, -needleRadius / 2],
    topPoint = [
      centerPoint[0] - needleLength * Math.cos(theta),
      centerPoint[1] - needleLength * Math.sin(theta),
    ],
    leftPoint = [
      centerPoint[0] - needleRadius * Math.cos(theta - Math.PI / 2),
      centerPoint[1] - needleRadius * Math.sin(theta - Math.PI / 2),
    ],
    rightPoint = [
      centerPoint[0] - needleRadius * Math.cos(theta + Math.PI / 2),
      centerPoint[1] - needleRadius * Math.sin(theta + Math.PI / 2),
    ];
  var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
  return pathStr;
};

//Returns the angle (in rad) for the given 'percent' value where percent = 1 means 100% and is 180 degree angle
const percentToRad = (percent) => {
  return percent * Math.PI;
};

//Adds text undeneath the graft to display which percentage is the current one
const addText = (percentage, props, outerRadius, width, g) => {
  const { formatTextValue, fontSize } = props;
  var textPadding = 20;
  const text = formatTextValue
    ? formatTextValue(floatingNumber(percentage))
    : floatingNumber(percentage) + "%";
  g.current
    .append("g")
    .attr("class", "text-group")
    .attr(
      "transform",
      `translate(${outerRadius.current}, ${
        outerRadius.current / 2 + textPadding
      })`
    )
    .append("text")
    .text(text)
    // this computation avoid text overflow. When formatted value is over 10 characters, we should reduce font size
    .style("font-size", () =>
      fontSize
        ? fontSize
        : `${width.current / 11 / (text.length > 10 ? text.length / 10 : 1)}px`
    )
    .style("fill", props.textColor)
    .style("text-anchor", "middle");
};

const floatingNumber = (value, maxDigits = 2) => {
  return Math.round(value * 100 * 10 ** maxDigits) / 10 ** maxDigits;
};

const calculateRadius = (width, height, outerRadius, margin, g) => {
  //The radius needs to be constrained by the containing div
  //Since it is a half circle we are dealing with the height of the div
  //Only needs to be half of the width, because the width needs to be 2 * radius
  //For the whole arc to fit

  //First check if it is the width or the height that is the "limiting" dimension
  if (width.current < 2 * height.current) {
    //Then the width limits the size of the chart
    //Set the radius to the width - the horizontal margins
    outerRadius.current =
      (width.current - margin.current.left - margin.current.right) / 2;
  } else {
    outerRadius.current =
      height.current - margin.current.top - margin.current.bottom;
  }
  centerGraph(width, g, outerRadius, margin);
};

//Calculates new margins to make the graph centered
const centerGraph = (width, g, outerRadius, margin) => {
  margin.current.left =
    width.current / 2 - outerRadius.current + margin.current.right;
  g.current.attr(
    "transform",
    "translate(" + margin.current.left + ", " + margin.current.top + ")"
  );
};

const updateDimensions = (props, container, margin, width, height) => {
  //TODO: Fix so that the container is included in the component
  const { marginInPercent } = props;
  var divDimensions = container.current.node().getBoundingClientRect(),
    divWidth = divDimensions.width,
    divHeight = divDimensions.height;

  //Set the new width and horizontal margins
  margin.current.left = divWidth * marginInPercent;
  margin.current.right = divWidth * marginInPercent;
  width.current = divWidth - margin.current.left - margin.current.right;

  margin.current.top = divHeight * marginInPercent;
  margin.current.bottom = divHeight * marginInPercent;
  height.current =
    width.current / 2 - margin.current.top - margin.current.bottom;
  //height.current = divHeight - margin.current.top - margin.current.bottom;
};
