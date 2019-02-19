# react-gauge-chart
React component for displaying a gauge chart

##### Options for the Gague chart
- `nrOfLevels` specifies the number of separate arc parts in the graph.
- `margin` sets the margin from the edge of the SVG in percent to the outer radius of the arc. The value should be given as a decimal number in the range `[0, 1]`. Default set to `0.05` (5%).
- `arcPadding` sets the padding in percent between the arcs in the chart. The value should be given as a decimal number in the range `[0, 1]`. Default value `0.05` (5%)
- `arcWidth` sets the width of the arc in percent. The value should be given as a decimal number in the range `[0, 1]`. Default value `0.2` (20%)
- `cornerRadius` sets the corner radius for the arcs. Default value `6`. Set to `0` if no corner radius is wanted
- `colors` should be an array containing colors in hex format. Default values is hsl interpolation between **green** and **red**.


##### Colors for the chart

The colors could either be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would a color in the array (colors are assigned from left to right). If that is the case, then the **length of the array**
must match the **number of levels** in the arc.
If the number of colors does not match the number of levels, then the **first** and the **last** color from the colors array will
be selected and the arcs will get colors that are interpolated between those. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).

