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

import { setArcData, formatValue } from "./utils";
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
  clampNeedle: false,
  animateDuration: 3000,
  textComponent: undefined,
  needleScale: 0.55,
  showArcLabels: false,
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

  // What a re-render used to do: rebuild the svg, then draw the update on it.
  // The rebuild no longer animates, so the needle keeps going from where it
  // was instead of restarting from 0 (#81).
  const redraw = (resize) => {
    initChart(false, true, prevProps.current);
    initChart(true, resize, prevProps.current);
  };

  // Create the chart once, on mount. Later prop changes redraw it through the
  // effect below, so a parent re-render no longer rebuilds the chart and
  // restarts the needle from 0 (#81, #112).
  useLayoutEffect(() => {
    setArcData(props, nbArcsToDisplay, colorArray, arcData);
    container.current = select(selectedRef);
    //Initialize chart
    initChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastWidth = useRef(null);
  // Every prop that changes the drawing. Functions (often inline, so new on
  // every render) and React elements (rendered by React itself) are left out;
  // the effect after this one keeps the texts of the functions up to date.
  const drawingProps = {};
  Object.keys(props).forEach((key) => {
    const value = props[key];
    if (typeof value === "function") {
      if (key === "needleTooltip") drawingProps[key] = true;
    } else if (!React.isValidElement(value)) {
      drawingProps[key] = value;
    }
  });
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
    redraw(resize);
    prevProps.current = props;
  }, [drawingProps]);

  // Function props (formatTextValue, needleTooltip) are often written inline,
  // so they are new on every render. Redrawing for them would interrupt the
  // needle animation, so only the texts they produce are refreshed.
  useEffect(() => {
    if (!container.current || !container.current.select) return;
    // A re-render used to rebuild the chart, which also picked up a new
    // container width (e.g. a resized parent). Keep that: redraw without
    // animation when the width has changed since the last draw.
    const node = container.current.node && container.current.node();
    if (node && node.getBoundingClientRect) {
      const divWidth = node.getBoundingClientRect().width;
      if (lastWidth.current !== null && Math.abs(divWidth - lastWidth.current) > 0.5) {
        lastWidth.current = divWidth;
        redraw(true);
        return;
      }
      lastWidth.current = divWidth;
    }
    if (!props.hideText && !props.textComponent) {
      const text = formatValue(props.percent, props);
      const textNode = container.current.select(".text-group text");
      // The text is sized to fit, so a different text needs a redraw
      if (!textNode.empty() && textNode.text() !== String(text)) {
        redraw(true);
        return;
      }
    }
    if (typeof props.needleTooltip === "function") {
      const title = container.current.select(".needle title");
      const tooltip = props.needleTooltip(props.percent);
      if (!title.empty() && title.text() !== String(tooltip)) title.text(tooltip);
    }
  });

  // The latest window-resize handler, for the ResizeObserver below
  const handleResizeRef = useRef(null);

  useEffect(() => {
    // Redraw the same way as a mount or a props update, on a fresh svg, so a
    // resized chart has the same size as one first drawn at that width. The
    // old in-place resize measured the container while it still held the
    // previous svg, so the chart came out smaller after shrinking (larger
    // after growing) and jumped back on the next props update (#27).
    const handleResize = () => {
      const node =
        container.current && container.current.node && container.current.node();
      if (!node) return;
      const divWidth = node.getBoundingClientRect().width;
      // A hidden container (display: none, a closed tab) measures 0 wide:
      // keep the current drawing and redraw once it is visible again
      if (divWidth <= 0) return;
      // Nothing to do when the width is unchanged (e.g. only the height of the
      // window changed, or the chart's own height changed)
      const svgNode = container.current.select("svg").node();
      const drawnWidth = svgNode ? parseFloat(svgNode.getAttribute("width")) : NaN;
      if (Math.abs(divWidth - drawnWidth) <= 0.5) return;
      lastWidth.current = divWidth;
      redraw(true);
    };
    handleResizeRef.current = handleResize;
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  // Also follow the container's own width, not only the window's (#27).
  // A parent that changes width without a window resize (a sidebar, a tab,
  // a grid column, a scrollbar appearing) used to leave the chart at its old
  // size until the next props update, which then resized every chart at once.
  useEffect(() => {
    const node =
      container.current && container.current.node && container.current.node();
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    let frame = null;
    const check = () => {
      frame = null;
      if (handleResizeRef.current) handleResizeRef.current();
    };
    const observer = new ResizeObserver(() => {
      // Wait a frame: avoids "ResizeObserver loop" warnings and merges bursts
      if (frame === null) frame = requestAnimationFrame(check);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  clampNeedle: PropTypes.bool,
  fontSize: PropTypes.string,
  animateDuration: PropTypes.number,
  animDelay: PropTypes.number,
  textComponent: PropTypes.element,
  textComponentContainerClassName: PropTypes.string,
  needleScale: PropTypes.number,
  customNeedleComponent: PropTypes.element,
  customNeedleComponentClassName: PropTypes.string,
  customNeedleStyle: PropTypes.object,
  showArcLabels: PropTypes.bool,
  arcLabels: PropTypes.arrayOf(PropTypes.string),
  needleTooltip: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  referenceLines: PropTypes.arrayOf(
    PropTypes.shape({
      percent: PropTypes.number.isRequired,
      label: PropTypes.node,
      color: PropTypes.string,
      width: PropTypes.number,
    })
  ),
};


