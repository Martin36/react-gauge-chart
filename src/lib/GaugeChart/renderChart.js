import { select } from "d3";
import { updateDimensions, calculateRadius, drawReferenceLines } from "./utils";

//Renders the chart, should be called every time the window is resized
export const renderChart = (
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
  // Without a DOM element to draw in (e.g. react-test-renderer or an
  // unmounted chart) there is nothing to measure or draw (#85)
  if (!container.current || !container.current.node || !container.current.node()) {
    return;
  }
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
  g.current.selectAll(".text-group").remove();
  //Draw the arc
  let arcPaths = doughnut.current
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
  //Show the arc's label as a tooltip on hover
  if (Array.isArray(props.arcLabels)) {
    arcPaths.each(function (d, i) {
      const label = props.arcLabels[i];
      if (label !== undefined && label !== null && label !== "") {
        select(this).append("title").text(label);
      }
    });
  }
  //With showArcLabels, also write each arc's label on the arc itself (#43).
  //font-size and fill are attributes, so a .arc-label CSS rule can override them
  if (props.showArcLabels && Array.isArray(props.arcLabels)) {
    const fontSize = Math.max(8, outerRadius.current * props.arcWidth * 0.35);
    arcPaths.each(function (d, i) {
      const label = props.arcLabels[i];
      if (label === undefined || label === null || label === "") return;
      const [x, y] = arcChart.current.centroid(d);
      select(this)
        .append("text")
        .attr("class", "arc-label")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", `${fontSize}px`)
        .attr("fill", props.textColor)
        .style("pointer-events", "none")
        .text(label);
    });
  }
  drawReferenceLines(props, doughnut, outerRadius, width);
};


