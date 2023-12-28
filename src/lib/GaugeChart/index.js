import React, {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  arc,
  pie,
  select,
} from "d3";
import PropTypes from "prop-types";

import { setArcData } from "./utils";
import { renderChart } from "./renderChart";
import { drawNeedle } from "./drawNeedle";

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

const defaultProps = {
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
  textComponent: undefined,
  needleScale: 0.55,
  customNeedleComponent: null,
};

const GaugeChart = (initialProps) => {
  const props = useMemo(
    () => ({ ...defaultProps, ...initialProps }),
    [initialProps]
  );
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
        !customNeedleComponent && drawNeedle(
          resize,
          prevProps,
          props,
          width,
          needle,
          container,
          outerRadius,
          g
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

      !customNeedleComponent &&  drawNeedle(
        resize,
        prevProps,
        props,
        width,
        needle,
        container,
        outerRadius,
        g
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
      let resize = true;

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

      !customNeedleComponent &&  drawNeedle(
        resize,
        prevProps,
        props,
        width,
        needle,
        container,
        outerRadius,
        g
      );
    };
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const {
    id,
    style,
    className,
    textComponent,
    textComponentContainerClassName,
    customNeedleComponent,
    customNeedleStyle,
    customNeedleComponentClassName,
  } = props;

  return (
    <div
      id={id}
      className={className}
      style={style}
      >
      <div ref={(svg) => (selectedRef = svg)}>
        <div
          className={textComponentContainerClassName}
          style={{ position: "relative", top: "50%" }}
        >
          {textComponent}
        </div>
      </div>
      {customNeedleComponent && <div className={customNeedleComponentClassName} style={{ position: "relative", ...customNeedleStyle }}>
        {customNeedleComponent}
      </div>}
    </div>
  );
};

export default GaugeChart;

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
  textComponent: PropTypes.element,
  textComponentContainerClassName: PropTypes.string,
  needleScale: PropTypes.number,
  customNeedleComponent: PropTypes.element,
  customNeedleComponentClassName: PropTypes.string,
  customNeedleStyle: PropTypes.object
};


