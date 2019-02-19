import React from "react";
import * as d3 from 'd3';

/*
GaugeChart creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
TODO: Lägg till info om 'data' i docs
*/


class GaugeChart extends React.Component {
  //TODO: Change options to props    
  constructor() {
    //Class variables
    var svg,
        container = d3.select(containerID),
        g,
        width,
        height,
        doughnut,
        needle,
        data,
        outerRadius,
        arc = d3.arc(),
        pie = d3.pie(),
        startAngle = -Math.PI/2,  //Negative x-axis
        endAngle = Math.PI/2,     //Positive x-axis
        margin = {};  // = {top: 20, right: 50, bottom: 50, left: 50},

    //Setup the optional parameters
    //Need to do the 'typeof' check if the parameter is allowed to be 0
    var marginInPercent = (typeof options.margin === 'undefined') ? 0.05 : options.margin,
        cornerRadius = (typeof options.cornerRadius === 'undefined') ? 6 : options.cornerRadius,
        nrOfLevels = options.nrOfLevels || 3,
        percent = options.data || 0.4,
        arcPadding = options.arcPadding || 0.05,        //The padding between arcs, in rad
        arcWidth = options.arcWidth || 0.2,           //The width of the arc given in percent of the radius
        colors = options.colors || ["#00FF00", "#FF0000"];  //Default defined colors
  
    //Check if the number of colors equals the number of levels
    //Otherwise make an interpolation
    if(nrOfLevels === colors.length){
      var colorArray = colors;
    }
    else{
      var colorArray = getColors();
    }
    //The data that is used to create the arc
    //The value is 1 for all objects because the arcs should be of same size
    var arcData = [];
    for(var i = 0; i < nrOfLevels; i++){
      var arcDatum = {
        value: 1,
        color: colorArray[i]
      }
      arcData.push(arcDatum);
    }
    //Get data and initialize chart
    //This data should be used to rotate the needle
    d3.json("../data/stock-data.json", init);
  }

  init = (json) => {
    data = json;
    svg = container.append("svg");
    g = svg.append("g")   //Used for margins
    doughnut = g.append("g")
      .attr("class", "doughnut");
    //Set up the pie generator
    //Each arc should be of equal length (or should they?)
    pie.value(function(d) { return d.value; })
      //.padAngle(arcPadding)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .sort(null);
    //Add the needle element
    needle = g.append("g")
      .attr("class", "needle");
    //Set up resize event listener to re-render the chart everytime the window is resized
    window.addEventListener('resize', function(){
      var resize = true;
      render(resize);
    });
    render();

  }

  //Renders the chart, should be called every time the window is resized
  render = (resize) => {
    updateDimensions();
    //Set dimensions of svg element and translations
    svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    g.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
    //Set the radius to lesser of width or height and remove the margins
    //Calculate the new radius
    calculateRadius();
    doughnut.attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");
    //Setup the arc
    arc.outerRadius(outerRadius)
      .innerRadius(outerRadius * (1-arcWidth))
      .cornerRadius(cornerRadius)
      .padAngle(arcPadding);
    //Remove the old stuff
    doughnut.selectAll(".arc").remove();
    needle.selectAll("*").remove();
    g.selectAll(".text-group").remove();
    //Draw the arc
    var arcPaths = doughnut.selectAll(".arc")
        .data(pie(arcData))
      .enter().append("g")
        .attr("class", "arc");
    arcPaths.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return d.data.color; });

    drawNeedle(resize);
    //Translate the needle starting point to the middle of the arc
    needle.attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");
  }

  updateDimensions = () => {
    var divDimensions = container.node().getBoundingClientRect(),
        divWidth = divDimensions.width,
        divHeight = divDimensions.height;
    //Set the new width and horizontal margins
    margin.left = divWidth * marginInPercent;
    margin.right = divWidth * marginInPercent;
    width = divWidth - margin.left - margin.right;

    margin.top = divHeight * marginInPercent;
    margin.bottom = divHeight * marginInPercent;
    height = divHeight - margin.top - margin.bottom;
  }

  calculateRadius = () => {
    //The radius needs to be constrained by the containing div
    //Since it is a half circle we are dealing with the height of the div
    //Only needs to be half of the width, because the width needs to be 2 * radius
    //For the whole arc to fit

    //First check if it is the width or the height that is the "limiting" dimension
    if(width < 2*height) {
      //Then the width limits the size of the chart
      //Set the radius to the width - the horizontal margins
      outerRadius = (width - margin.left - margin.right)/2;
    }
    else {
      outerRadius = height - margin.top - margin.bottom;
    }
    centerGraph();
  }

  //Calculates new margins to make the graph centered
  centerGraph = () => {
    margin.left = width/2 - outerRadius + margin.right;
    g.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
  }
  
  //If 'resize' is true then the animation does not play
  drawNeedle = (resize) => {
    var needleLength = outerRadius*0.55,    //TODO: Maybe it should be specified as a percentage of the arc radius?
        needleRadius = 15,
        centerPoint = [0, -needleRadius/2],
        topPoint = [centerPoint[0], centerPoint[1] - needleLength],
        leftPoint = [centerPoint[0] - needleRadius, centerPoint[1]],
        rightPoint = [centerPoint[0] + needleRadius, centerPoint[1]];
    //Draw the triangle
    //var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
    var pathStr = calculateRotation(0);
    needle.append("path")
      .attr("d", pathStr)
      .attr("fill", "#464A4F");
    //Add a circle at the bottom of needle
    needle.append("circle")
      .attr("cx", centerPoint[0])
      .attr("cy", centerPoint[1])
      .attr("r", needleRadius)
      .attr("fill", "#464A4F");
    addText(percent);
    //Rotate the needle
    if(!resize){
      needle.transition()
      .delay(500)
      .ease(d3.easeElastic)
      .duration(3000)
      .tween('progress', function(){
        return function(percentOfPercent){
          var progress = percentOfPercent * percent;
          return d3.select(`${containerID} .needle path`).attr("d", calculateRotation(progress));
        }
      });
    }
    else{
      d3.select(`${containerID} .needle path`).attr("d", calculateRotation(percent));
    }
  }

  calculateRotation = (percent) => {
    var needleLength = outerRadius*0.55,    //TODO: Maybe it should be specified as a percentage of the arc radius?
        needleRadius = 15,
        theta = percentToRad(percent),
        centerPoint = [0, -needleRadius/2],
        topPoint = [centerPoint[0] - needleLength * Math.cos(theta),
                    centerPoint[1] - needleLength * Math.sin(theta)],
        leftPoint = [centerPoint[0] - needleRadius * Math.cos(theta - Math.PI/2),
                     centerPoint[1] - needleRadius * Math.sin(theta - Math.PI/2)],
        rightPoint = [centerPoint[0] - needleRadius * Math.cos(theta + Math.PI/2),
                      centerPoint[1] - needleRadius * Math.sin(theta + Math.PI/2)];
        var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
        return pathStr;
  }

  //Returns the angle (in rad) for the given 'percent' value where percent = 1 means 100% and is 180 degree angle
  percentToRad = (percent) => {
    return percent * Math.PI;
  }

  //Depending on the number of levels in the chart
  //This function returns the same number of colors
  getColors = () => {
    var colorScale = d3.scaleLinear()
      .domain([1, nrOfLevels])
      .range([colors[0], colors[colors.length-1]])  //Use the first and the last color as range
      .interpolate(d3.interpolateHsl);
    var colorArray = []
    for(var i = 1; i <= nrOfLevels; i++){
      colorArray.push(colorScale(i));
    }
    return colorArray;
  }

  //Adds text undeneath the graft to display which percentage is the current one
  addText = (percentage) => {
    var textPadding = 20;
    g.append("g")
        .attr("class", "text-group")
        .attr("transform", `translate(${outerRadius}, ${outerRadius / 2 + textPadding})`)
      .append("text")
        .text(`${percentage*100}%`)
        .attr("class", "percent-text");
  }


  render() {

  }
}

export default GaugeChart;
