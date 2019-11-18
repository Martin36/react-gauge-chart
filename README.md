# react-gauge-chart
React component for displaying a gauge chart, using D3.js

# Usage
Install it by running `npm install react-gauge-chart`. Then to use it:

```jsx
import GaugeChart from 'react-gauge-chart'

<GaugeChart id="gauge-chart1" />
```

## Examples

Check the demo below for live examples of the charts

#### To create a default chart

```jsx
<GaugeChart id="gauge-chart1" />
```

#### Chart with 20 levels and pointer at 86%

```jsx
<GaugeChart id="gauge-chart2" 
  nrOfLevels={20} 
  percent={0.86} 
/>
```

#### Chart with custom colors and larger arc width

```jsx
<GaugeChart id="gauge-chart3" 
  nrOfLevels={30} 
  colors={["#FF5F6D", "#FFC371"]} 
  arcWidth={0.3} 
  percent={0.37} 
/>
```

#### Chart with other corner radius and larger padding between arcs

```jsx
<GaugeChart id="gauge-chart4" 
  nrOfLevels={10} 
  arcPadding={0.1} 
  cornerRadius={3} 
  percent={0.6} 
/>
```

#### Chart with custom arcs width

```jsx
<GaugeChart id="gauge-chart5"
  nrOfLevels={420}
  arcsLength={[0.3, 0.5, 0.2]}
  colors={['#5BE12C', '#F5CD19', '#EA4228']}
  percent={0.37}
  arcPadding={0.02}
/>
```

#### Chart with disabled animation

```jsx
<GaugeChart id="gauge-chart6" 
  animate={false} 
  nrOfLevels={15} 
  percent={0.56} 
  needleColor="#345243" 
/>
```

# Demo
https://martin36.github.io/react-gauge-chart/

# API

## <GaugeChart />

### Warning: Do not use the same `id` for multiple charts, as it will put multiple charts in the same container

The props for the chart:

| Name            | PropType                    | Description                                                    | Default value          |
|-----------------|-----------------------------|----------------------------------------------------------------|------------------------|
| id              | PropTypes.string.isRequired | Used for the identification of the div surrounding the chart   |                        |
| className       | PropTypes.string            | Add `className` to the div container                           |                        |
| style           | PropTypes.object            | Add `style` to the div container                               | { width: '100%' }      |
| marginInPercent | PropTypes.number            | Margin for the chart inside the containing SVG element         | 0.05                   |
| cornerRadius    | PropTypes.number            | Corner radius for the elements in the chart                    | 6                      |
| nrOfLevels      | PropTypes.number            | The number of elements displayed in the arc                    | 3                      |
| percent         | PropTypes.number            | The number where the pointer should point to (between 0 and 1) | 0.4                    |
| arcPadding      | PropTypes.number            | The distance between the elements in the arc                   | 0.05                   |
| arcWidth        | PropTypes.number            | The thickness of the arc                                       | 0.2                    |
| colors          | PropTypes.array             | An array of colors in HEX format displayed in the arc          | ["#00FF00", "#FF0000"] |
| textColor       | PropTypes.string            | The color of the text                                          | "#FFFFFF"              |
| needleColor     | PropTypes.string            | The color of the needle triangle                               | "#464A4F"              |
| needleBaseColor | PropTypes.string            | The color of the circle at the base of the needle              | "#464A4F"              |
| hideText        | PropTypes.bool              | Whether or not to hide the percentage display                  | false                  |
| arcsLength      | PropTypes.array             | An array specifying the lenght of the each individual arc. If this prop is then the nrOfLevels prop will have no effect      | none                   |
| animate         | PropTypes.bool              | Whether or not to animate the needle when loaded               | true                   |
| animDelay       | PropTypes.number            | Delay in ms before start the needle animation                  | 500                    |

##### Colors for the chart

The colors could either be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would a color in the array (colors are assigned from left to right). If that is the case, then the **length of the array**
must match the **number of levels** in the arc.
If the number of colors does not match the number of levels, then the **first** and the **last** color from the colors array will
be selected and the arcs will get colors that are interpolated between those. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).
