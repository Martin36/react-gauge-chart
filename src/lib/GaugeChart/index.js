import React from 'react'
import {arc, easeElastic, interpolateHsl, pie, scaleLinear, select} from 'd3'
import PropTypes from 'prop-types'

import './style.css'
/*
GaugeChart creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
*/

//Constants
const startAngle = -Math.PI / 2 //Negative x-axis
const endAngle = Math.PI / 2 //Positive x-axis

// Props that should cause an animation on update
const animateNeedleProps = ['marginInPercent', 'arcPadding', 'percent', 'nrOfLevels']

class GaugeChart extends React.Component {

    state = {
        nbArcsToDisplay: this.props.nrOfLevels,
        arcData: [],
        mounted: false,
        colorArray: []
    }

    constructor(props) {
        super(props)
        const {nrOfLevels, colors} = this.props
        //Class variables
        this.svg = {}
        this.g = {}
        this.width = {}
        this.height = {}
        this.doughnut = {}
        this.needle = {}
        this.data = {}
        this.outerRadius = {}
        this.margin = {} // = {top: 20, right: 50, bottom: 50, left: 50},
        this.arc = arc()
        this.pie = pie()

        // We have to make a decision about number of arcs to display
        // If arcsLength is setted, we choose arcsLength length instead of nrOfLevels
        const nbArcs = props.arcsLength ? props.arcsLength.length : nrOfLevels
        this.setState({
            nbArcsToDisplay: nbArcs
        })

        //Check if the number of colors equals the number of levels
        //Otherwise make an interpolation
        if (nbArcs === colors.length) {
            this.colorArray = colors
        } else {
            this.colorArray = this.getColors()
        }

        //The data that is used to create the arc
        // Each arc could have hiw own value width arcsLength prop
        this.arcData = []
        for (var i = 0; i < nbArcs; i++) {
            var arcDatum = {
                value: props.arcsLength && props.arcsLength.length > i ? props.arcsLength[i] : 1,
                color: this.colorArray[i]
            }
            this.arcData.push(arcDatum)
        }
        this.setState({
            arcData: this.arcData,
            colorArray: this.colorArray,
            mounted:true
        })
    }

    componentDidMount() {
        if (this.props.id) {
            this.container = select(`#${this.props.id + this.state.nbArcsToDisplay}`)
            //Initialize chart
            this.initChart()
        }
    }

    componentDidUpdate(prevProps) {
        //Initialize chart
        // Always redraw the chart, but potentially do not animate it
        const resize = !animateNeedleProps.some(key => prevProps[key] !== this.props[key])
        this.initChart(true, resize)

        if(prevProps.nrOfLevels !== this.props.nrOfLevels){
            const nbArcs = this.props.arcsLength ? this.props.arcsLength.length : this.props.nrOfLevels

            let colorArray = []
            if (nbArcs === this.props.colors.length) {
                colorArray = this.props.colors
            } else {
                colorArray = this.getColors(nbArcs)
            }

            //The data that is used to create the arc
            // Each arc could have hiw own value width arcsLength prop
            this.arcData = []
            for (var i = 0; i < nbArcs; i++) {
                var arcDatum = {
                    value: this.props.arcsLength && this.props.arcsLength.length > i ? this.props.arcsLength[i] : 1,
                    color: colorArray[i]
                }
                this.arcData.push(arcDatum)
            }
            this.setState({
                arcData: this.arcData,
                nbArcsToDisplay: nbArcs
            })
        }
    }

    initChart = (update, resize = false) => {
        if (update) {
            this.renderChart(resize)
            return
        }

        this.svg = this.container.append('svg')
        this.g = this.svg.append('g') //Used for margins
        this.doughnut = this.g.append('g').attr('class', 'doughnut')

        //Set up the pie generator
        //Each arc should be of equal length (or should they?)
        this.pie
            .value(function (d) {
                return d.value
            })
            //.padAngle(arcPadding)
            .startAngle(startAngle)
            .endAngle(endAngle)
            .sort(null)
        //Add the needle element
        this.needle = this.g.append('g').attr('class', 'needle')
        //Set up resize event listener to re-render the chart everytime the window is resized
        window.addEventListener('resize', () => {
            var resize = true
            this.renderChart(resize)
        })
        this.renderChart(resize)
    }

    //Renders the chart, should be called every time the window is resized
    renderChart = resize => {
        this.updateDimensions()
        //Set dimensions of svg element and translations
        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
        this.g.attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')')
        //Set the radius to lesser of width or height and remove the margins
        //Calculate the new radius
        this.calculateRadius()
        this.doughnut.attr('transform', 'translate(' + this.outerRadius + ', ' + this.outerRadius + ')')
        //Setup the arc
        this.arc
            .outerRadius(this.outerRadius)
            .innerRadius(this.outerRadius * (1 - this.props.arcWidth))
            .cornerRadius(this.props.cornerRadius)
            .padAngle(this.props.arcPadding)
        //Remove the old stuff
        this.doughnut.selectAll('.arc').remove()
        this.needle.selectAll('*').remove()
        this.g.selectAll('.text-group').remove()
        //Draw the arc
        var arcPaths = this.doughnut
            .selectAll('.arc')
            .data(this.pie(!this.state.mounted ? this.arcData : this.state.arcData))
            .enter()
            .append('g')
            .attr('class', 'arc')
        arcPaths
            .append('path')
            .attr('d', this.arc)
            .style('fill', function (d) {
                return d.data.color
            })

        this.drawNeedle(resize)
        //Translate the needle starting point to the middle of the arc
        this.needle.attr('transform', 'translate(' + this.outerRadius + ', ' + this.outerRadius + ')')
    }

    updateDimensions = () => {
        //TODO: Fix so that the container is included in the component
        const {marginInPercent} = this.props
        var divDimensions = this.container.node().getBoundingClientRect(),
            divWidth = divDimensions.width,
            divHeight = divDimensions.height
        //Set the new width and horizontal margins
        this.margin.left = divWidth * marginInPercent
        this.margin.right = divWidth * marginInPercent
        this.width = divWidth - this.margin.left - this.margin.right

        this.margin.top = divHeight * marginInPercent
        this.margin.bottom = divHeight * marginInPercent
        this.height = this.width / 2 - this.margin.top - this.margin.bottom
        //this.height = divHeight - this.margin.top - this.margin.bottom;
    }

    calculateRadius = () => {
        //The radius needs to be constrained by the containing div
        //Since it is a half circle we are dealing with the height of the div
        //Only needs to be half of the width, because the width needs to be 2 * radius
        //For the whole arc to fit

        //First check if it is the width or the height that is the "limiting" dimension
        if (this.width < 2 * this.height) {
            //Then the width limits the size of the chart
            //Set the radius to the width - the horizontal margins
            this.outerRadius = (this.width - this.margin.left - this.margin.right) / 2
        } else {
            this.outerRadius = this.height - this.margin.top - this.margin.bottom
        }
        this.centerGraph()
    }

    //Calculates new margins to make the graph centered
    centerGraph = () => {
        this.margin.left = this.width / 2 - this.outerRadius + this.margin.right
        this.g.attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')')
    }

    //If 'resize' is true then the animation does not play
    drawNeedle = (resize) => {
        const {percent, needleColor, needleBaseColor, hideText, animate} = this.props;
        const {container, calculateRotation} = this;
        var needleRadius = 15 * (this.width / 500),   // Make the needle radius responsive
            centerPoint = [0, -needleRadius / 2];
        //Draw the triangle
        //var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
        var pathStr = this.calculateRotation(0)
        this.needle
            .append('path')
            .attr('d', pathStr)
            .attr('fill', needleColor)
        //Add a circle at the bottom of needle
        this.needle
            .append('circle')
            .attr('cx', centerPoint[0])
            .attr('cy', centerPoint[1])
            .attr('r', needleRadius)
            .attr('fill', needleBaseColor)
        if (!hideText) {
            this.addText(percent)
        }
        //Rotate the needle
        if (!resize && animate) {
            this.needle.transition()
                .delay(500)
                .ease(easeElastic)
                .duration(3000)
                .tween('progress', function () {
                    return function (percentOfPercent) {
                        var progress = percentOfPercent * percent;
                        return container.select(`.needle path`).attr("d", calculateRotation(progress));
                    }
                });
        } else {
            container.select(`.needle path`).attr("d", calculateRotation(percent));
        }
    }

    calculateRotation = percent => {
        var needleLength = this.outerRadius * 0.55, //TODO: Maybe it should be specified as a percentage of the arc radius?
            needleRadius = 15 * (this.width / 500),
            theta = this.percentToRad(percent),
            centerPoint = [0, -needleRadius / 2],
            topPoint = [centerPoint[0] - needleLength * Math.cos(theta), centerPoint[1] - needleLength * Math.sin(theta)],
            leftPoint = [
                centerPoint[0] - needleRadius * Math.cos(theta - Math.PI / 2),
                centerPoint[1] - needleRadius * Math.sin(theta - Math.PI / 2)
            ],
            rightPoint = [
                centerPoint[0] - needleRadius * Math.cos(theta + Math.PI / 2),
                centerPoint[1] - needleRadius * Math.sin(theta + Math.PI / 2)
            ]
        var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${
            rightPoint[1]
        }`
        return pathStr
    }

    //Returns the angle (in rad) for the given 'percent' value where percent = 1 means 100% and is 180 degree angle
    percentToRad = percent => {
        return percent * Math.PI
    }

    //Depending on the number of levels in the chart
    //This function returns the same number of colors
    getColors = (nbArcs) => {
        const {colors} = this.props
        var colorScale = scaleLinear()
            .domain([1, nbArcs ? nbArcs : this.state.nbArcsToDisplay])
            .range([colors[0], colors[colors.length - 1]]) //Use the first and the last color as range
            .interpolate(interpolateHsl)
        var colorArray = []
        const iterationCount = nbArcs ? nbArcs : this.state.nbArcsToDisplay
        for (var i = 1; i <= iterationCount; i++) {
            colorArray.push(colorScale(i))
        }
        return colorArray
    }

    //Adds text undeneath the graft to display which percentage is the current one
    addText = percentage => {
        var textPadding = 20
        this.g
            .append('g')
            .attr('class', 'text-group')
            .attr('transform', `translate(${this.outerRadius}, ${this.outerRadius / 2 + textPadding})`)
            .append('text')
            .text(`${this.floatingNumber(percentage)}%`)
            .style('font-size', () => `${this.width / 10}px`)
            .style('fill', this.props.textColor)
            .attr('class', 'percent-text')
    }

    floatingNumber = (value, maxDigits = 2) => {
        return Math.round(value * 100 * 10 ** maxDigits) / 10 ** maxDigits
    }

    render() {
        return <div>
            <h5>{Date.now()}</h5>
           <h6>{this.state.nbArcsToDisplay}</h6>
        <div id={this.props.id + this.state.nbArcsToDisplay} style={{width: '100%'}}/>
        </div>
    }
}

export default GaugeChart

GaugeChart.defaultProps = {
    marginInPercent: 0.05,
    cornerRadius: 6,
    nrOfLevels: 3,
    percent: 0.4,
    arcPadding: 0.05, //The padding between arcs, in rad
    arcWidth: 0.2, //The width of the arc given in percent of the radius
    colors: ['#00FF00', '#FF0000'], //Default defined colors
    textColor: '#fff',
    needleColor: "#464A4F",
    needleBaseColor: "#464A4F",
    hideText: false,
    animate: true
}

GaugeChart.propTypes = {
    id: PropTypes.string.isRequired,
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
    animate: PropTypes.bool
}
