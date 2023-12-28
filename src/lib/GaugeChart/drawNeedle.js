import {
  easeElastic,
  interpolateNumber,
} from "d3";
import { calculateRotation, addText } from "./utils"

//If 'resize' is true then the animation does not play
export const drawNeedle = (
  resize,
  prevProps,
  props,
  width,
  needle,
  container,
  outerRadius,
  g
) => {
  const {
    percent,
    needleColor,
    needleBaseColor,
    hideText,
    animate,
    needleScale,
    textComponent,
  } = props;
  let needleRadius = 15 * (width.current / 500), // Make the needle radius responsive
    centerPoint = [0, -needleRadius / 2];

  //Remove the old stuff
  needle.current.selectAll("*").remove();

  //Translate the needle starting point to the middle of the arc
  needle.current.attr(
    "transform",
    "translate(" + outerRadius.current + ", " + outerRadius.current + ")"
  );

  //Draw the triangle
  //let pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
  const prevPercent = prevProps ? prevProps.percent : 0;
  let pathStr = calculateRotation(
    prevPercent || percent,
    outerRadius,
    width,
    needleScale
  );
  needle.current.append("path").attr("d", pathStr).attr("fill", needleColor);
  //Add a circle at the bottom of needle
  needle.current
    .append("circle")
    .attr("cx", centerPoint[0])
    .attr("cy", centerPoint[1])
    .attr("r", needleRadius)
    .attr("fill", needleBaseColor);
  if (!hideText && !textComponent) {
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
            .attr(
              "d",
              calculateRotation(progress, outerRadius, width, needleScale)
            );
        };
      });
  } else {
    container.current
      .select(`.needle path`)
      .attr("d", calculateRotation(percent, outerRadius, width, needleScale));
  }
};

