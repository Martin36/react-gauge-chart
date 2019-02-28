# react-gauge-chart
React component for displaying a gauge chart, using D3.js

# Usage
Install it by running `npm install react-gauge-chart`. Then to use it:

```jsx
import GaugeChart from 'react-gauge-chart'

<GaugeChart id="gauge-chart1" />
```

# Demo


# API

## <GaugeChart />

The props for the chart:

| Name            | PropType                    | Description                                                    | Default value          |
|-----------------|-----------------------------|----------------------------------------------------------------|------------------------|
| id              | PropTypes.string.isRequired | Used for the identification of the div surrounding the chart   |                        |
| marginInPercent | PropTypes.number            | Margin for the chart inside the containing SVG element         | 0.05                   |
| cornerRadius    | PropTypes.number            | Corner radius for the elements in the chart                    | 6                      |
| nrOfLevels      | PropTypes.number            | The number of elements displayed in the arc                    | 3                      |
| percent         | PropTypes.number            | The number where the pointer should point to (between 0 and 1) | 0.4                    |
| arcPadding      | PropTypes.number            | The distance between the elements in the arc                   | 0.05                   |
| arcWidth        | PropTypes.number            | The thickness of the arc                                       | 0.2                    |
| colors          | PropTypes.array             | An array of colors in HEX format displayed in the arc          | ["#00FF00", "#FF0000"] |
| textColor       | PropTypes.string            | The color of the text                                          | "#FFFFFF"              |

##### Colors for the chart

The colors could either be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would a color in the array (colors are assigned from left to right). If that is the case, then the **length of the array**
must match the **number of levels** in the arc.
If the number of colors does not match the number of levels, then the **first** and the **last** color from the colors array will
be selected and the arcs will get colors that are interpolated between those. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).

