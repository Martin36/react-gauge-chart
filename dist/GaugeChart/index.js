"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _d = require("d3");

var _propTypes = _interopRequireDefault(require("prop-types"));

require("./style.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
GaugeChart creates a gauge chart using D3
The chart is responsive and will have the same width as the "container"
The radius of the gauge depends on the width and height of the container
It will use whichever is smallest of width or height
The svg element surrounding the gauge will always be square
"container" is the div where the chart should be placed
*/
//Constants
var startAngle = -Math.PI / 2; //Negative x-axis

var endAngle = Math.PI / 2; //Positive x-axis

var defaultStyle = {
  width: '100%'
}; // Props that should cause an animation on update

var animateNeedleProps = ['marginInPercent', 'arcPadding', 'percent', 'nrOfLevels', 'animDelay'];

var GaugeChart =
/*#__PURE__*/
function (_React$Component) {
  _inherits(GaugeChart, _React$Component);

  //TODO: Change props to props
  function GaugeChart(props) {
    var _this;

    _classCallCheck(this, GaugeChart);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GaugeChart).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "initChart", function (update) {
      var resize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var prevProps = arguments.length > 2 ? arguments[2] : undefined;

      if (update) {
        _this.renderChart(resize, prevProps);

        return;
      }

      _this.svg = _this.container.append("svg");
      _this.g = _this.svg.append("g"); //Used for margins

      _this.doughnut = _this.g.append("g").attr("class", "doughnut"); //Set up the pie generator
      //Each arc should be of equal length (or should they?)

      _this.pie.value(function (d) {
        return d.value;
      }) //.padAngle(arcPadding)
      .startAngle(startAngle).endAngle(endAngle).sort(null); //Add the needle element


      _this.needle = _this.g.append('g').attr('class', 'needle'); //Set up resize event listener to re-render the chart everytime the window is resized

      window.addEventListener('resize', function () {
        var resize = true;

        _this.renderChart(resize, prevProps);
      });

      _this.renderChart(resize, prevProps);
    });

    _defineProperty(_assertThisInitialized(_this), "renderChart", function (resize, prevProps) {
      _this.updateDimensions(); //Set dimensions of svg element and translations


      _this.svg.attr('width', _this.width + _this.margin.left + _this.margin.right).attr('height', _this.height + _this.margin.top + _this.margin.bottom);

      _this.g.attr('transform', 'translate(' + _this.margin.left + ', ' + _this.margin.top + ')'); //Set the radius to lesser of width or height and remove the margins
      //Calculate the new radius


      _this.calculateRadius();

      _this.doughnut.attr('transform', 'translate(' + _this.outerRadius + ', ' + _this.outerRadius + ')'); //Setup the arc


      _this.arc.outerRadius(_this.outerRadius).innerRadius(_this.outerRadius * (1 - _this.props.arcWidth)).cornerRadius(_this.props.cornerRadius).padAngle(_this.props.arcPadding); //Remove the old stuff


      _this.doughnut.selectAll('.arc').remove();

      _this.needle.selectAll('*').remove();

      _this.g.selectAll('.text-group').remove(); //Draw the arc


      var arcPaths = _this.doughnut.selectAll('.arc').data(_this.pie(_this.arcData)).enter().append('g').attr('class', 'arc');

      arcPaths.append('path').attr('d', _this.arc).style('fill', function (d) {
        return d.data.color;
      });

      _this.drawNeedle(resize, prevProps); //Translate the needle starting point to the middle of the arc


      _this.needle.attr('transform', 'translate(' + _this.outerRadius + ', ' + _this.outerRadius + ')');
    });

    _defineProperty(_assertThisInitialized(_this), "updateDimensions", function () {
      //TODO: Fix so that the container is included in the component
      var marginInPercent = _this.props.marginInPercent;

      var divDimensions = _this.container.node().getBoundingClientRect(),
          divWidth = divDimensions.width,
          divHeight = divDimensions.height; //Set the new width and horizontal margins


      _this.margin.left = divWidth * marginInPercent;
      _this.margin.right = divWidth * marginInPercent;
      _this.width = divWidth - _this.margin.left - _this.margin.right;
      _this.margin.top = divHeight * marginInPercent;
      _this.margin.bottom = divHeight * marginInPercent;
      _this.height = _this.width / 2 - _this.margin.top - _this.margin.bottom; //this.height = divHeight - this.margin.top - this.margin.bottom;
    });

    _defineProperty(_assertThisInitialized(_this), "calculateRadius", function () {
      //The radius needs to be constrained by the containing div
      //Since it is a half circle we are dealing with the height of the div
      //Only needs to be half of the width, because the width needs to be 2 * radius
      //For the whole arc to fit
      //First check if it is the width or the height that is the "limiting" dimension
      if (_this.width < 2 * _this.height) {
        //Then the width limits the size of the chart
        //Set the radius to the width - the horizontal margins
        _this.outerRadius = (_this.width - _this.margin.left - _this.margin.right) / 2;
      } else {
        _this.outerRadius = _this.height - _this.margin.top - _this.margin.bottom;
      }

      _this.centerGraph();
    });

    _defineProperty(_assertThisInitialized(_this), "centerGraph", function () {
      _this.margin.left = _this.width / 2 - _this.outerRadius + _this.margin.right;

      _this.g.attr('transform', 'translate(' + _this.margin.left + ', ' + _this.margin.top + ')');
    });

    _defineProperty(_assertThisInitialized(_this), "drawNeedle", function (resize, prevProps) {
      var _this$props = _this.props,
          percent = _this$props.percent,
          needleColor = _this$props.needleColor,
          needleBaseColor = _this$props.needleBaseColor,
          hideText = _this$props.hideText,
          animate = _this$props.animate;

      var _assertThisInitialize = _assertThisInitialized(_this),
          container = _assertThisInitialize.container,
          calculateRotation = _assertThisInitialize.calculateRotation;

      var needleRadius = 15 * (_this.width / 500),
          // Make the needle radius responsive
      centerPoint = [0, -needleRadius / 2]; //Draw the triangle
      //var pathStr = `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;

      var prevPercent = prevProps ? prevProps.percent : 0;

      var pathStr = _this.calculateRotation(prevPercent || percent);

      _this.needle.append("path").attr("d", pathStr).attr("fill", needleColor); //Add a circle at the bottom of needle


      _this.needle.append('circle').attr('cx', centerPoint[0]).attr('cy', centerPoint[1]).attr('r', needleRadius).attr('fill', needleBaseColor);

      if (!hideText) {
        _this.addText(percent);
      } //Rotate the needle


      if (!resize && animate) {
        _this.needle.transition().delay(_this.props.animDelay).ease(_d.easeElastic).duration(3000).tween('progress', function () {
          var currentPercent = (0, _d.interpolateNumber)(prevPercent, percent);
          return function (percentOfPercent) {
            var progress = currentPercent(percentOfPercent);
            return container.select(".needle path").attr("d", calculateRotation(progress));
          };
        });
      } else {
        container.select(".needle path").attr("d", calculateRotation(percent));
      }
    });

    _defineProperty(_assertThisInitialized(_this), "calculateRotation", function (percent) {
      var needleLength = _this.outerRadius * 0.55,
          //TODO: Maybe it should be specified as a percentage of the arc radius?
      needleRadius = 15 * (_this.width / 500),
          theta = _this.percentToRad(percent),
          centerPoint = [0, -needleRadius / 2],
          topPoint = [centerPoint[0] - needleLength * Math.cos(theta), centerPoint[1] - needleLength * Math.sin(theta)],
          leftPoint = [centerPoint[0] - needleRadius * Math.cos(theta - Math.PI / 2), centerPoint[1] - needleRadius * Math.sin(theta - Math.PI / 2)],
          rightPoint = [centerPoint[0] - needleRadius * Math.cos(theta + Math.PI / 2), centerPoint[1] - needleRadius * Math.sin(theta + Math.PI / 2)];

      var pathStr = "M ".concat(leftPoint[0], " ").concat(leftPoint[1], " L ").concat(topPoint[0], " ").concat(topPoint[1], " L ").concat(rightPoint[0], " ").concat(rightPoint[1]);
      return pathStr;
    });

    _defineProperty(_assertThisInitialized(_this), "percentToRad", function (percent) {
      return percent * Math.PI;
    });

    _defineProperty(_assertThisInitialized(_this), "getColors", function () {
      var colors = _this.props.colors;
      var colorScale = (0, _d.scaleLinear)().domain([1, _this.nbArcsToDisplay]).range([colors[0], colors[colors.length - 1]]) //Use the first and the last color as range
      .interpolate(_d.interpolateHsl);
      var colorArray = [];

      for (var i = 1; i <= _this.nbArcsToDisplay; i++) {
        colorArray.push(colorScale(i));
      }

      return colorArray;
    });

    _defineProperty(_assertThisInitialized(_this), "addText", function (percentage) {
      var textPadding = 20;

      _this.g.append('g').attr('class', 'text-group').attr('transform', "translate(".concat(_this.outerRadius, ", ").concat(_this.outerRadius / 2 + textPadding, ")")).append('text').text("".concat(_this.floatingNumber(percentage), "%")).style('font-size', function () {
        return "".concat(_this.width / 10, "px");
      }).style('fill', _this.props.textColor).attr('class', 'percent-text');
    });

    _defineProperty(_assertThisInitialized(_this), "floatingNumber", function (value) {
      var maxDigits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      return Math.round(value * 100 * Math.pow(10, maxDigits)) / Math.pow(10, maxDigits);
    });

    var _this$props2 = _this.props,
        nrOfLevels = _this$props2.nrOfLevels,
        _colors = _this$props2.colors; //Class variables

    _this.svg = {};
    _this.g = {};
    _this.width = {};
    _this.height = {};
    _this.doughnut = {};
    _this.needle = {};
    _this.data = {};
    _this.outerRadius = {};
    _this.margin = {}; // = {top: 20, right: 50, bottom: 50, left: 50},

    _this.arc = (0, _d.arc)();
    _this.pie = (0, _d.pie)(); // We have to make a decision about number of arcs to display
    // If arcsLength is setted, we choose arcsLength length instead of nrOfLevels

    _this.nbArcsToDisplay = props.arcsLength ? props.arcsLength.length : nrOfLevels; //Check if the number of colors equals the number of levels
    //Otherwise make an interpolation

    if (_this.nbArcsToDisplay === _colors.length) {
      _this.colorArray = _colors;
    } else {
      _this.colorArray = _this.getColors();
    } //The data that is used to create the arc
    // Each arc could have hiw own value width arcsLength prop


    _this.arcData = [];

    for (var _i = 0; _i < _this.nbArcsToDisplay; _i++) {
      var arcDatum = {
        value: props.arcsLength && props.arcsLength.length > _i ? props.arcsLength[_i] : 1,
        color: _this.colorArray[_i]
      };

      _this.arcData.push(arcDatum);
    }

    return _this;
  }

  _createClass(GaugeChart, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.id) {
        this.container = (0, _d.select)("#".concat(this.props.id)); //Initialize chart

        this.initChart();
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      //Initialize chart
      // Always redraw the chart, but potentially do not animate it
      var resize = !animateNeedleProps.some(function (key) {
        return prevProps[key] !== _this2.props[key];
      });
      this.initChart(true, resize, prevProps);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          id = _this$props3.id,
          style = _this$props3.style,
          className = _this$props3.className;
      return _react.default.createElement("div", {
        id: id,
        className: className,
        style: style
      });
    }
  }]);

  return GaugeChart;
}(_react.default.Component);

var _default = GaugeChart;
exports.default = _default;
GaugeChart.defaultProps = {
  style: defaultStyle,
  marginInPercent: 0.05,
  cornerRadius: 6,
  nrOfLevels: 3,
  percent: 0.4,
  arcPadding: 0.05,
  //The padding between arcs, in rad
  arcWidth: 0.2,
  //The width of the arc given in percent of the radius
  colors: ['#00FF00', '#FF0000'],
  //Default defined colors
  textColor: '#fff',
  needleColor: "#464A4F",
  needleBaseColor: "#464A4F",
  hideText: false,
  animate: true,
  animDelay: 500
};
GaugeChart.propTypes = {
  id: _propTypes.default.string.isRequired,
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  marginInPercent: _propTypes.default.number,
  cornerRadius: _propTypes.default.number,
  nrOfLevels: _propTypes.default.number,
  percent: _propTypes.default.number,
  arcPadding: _propTypes.default.number,
  arcWidth: _propTypes.default.number,
  arcsLength: _propTypes.default.array,
  colors: _propTypes.default.array,
  textColor: _propTypes.default.string,
  needleColor: _propTypes.default.string,
  needleBaseColor: _propTypes.default.string,
  hideText: _propTypes.default.bool,
  animate: _propTypes.default.bool
};