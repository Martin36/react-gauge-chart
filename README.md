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

#### Chart with tooltips

```jsx
<GaugeChart id="gauge-chart7"
  nrOfLevels={3}
  percent={0.62}
  arcLabels={["Low", "Medium", "High"]}
  needleTooltip={(percent) => `Speed: ${Math.round(percent * 120)} km/h`}
/>
```

#### Chart with reference lines

```jsx
<GaugeChart id="gauge-chart8"
  percent={0.32}
  textColor="#333333"
  referenceLines={[
    { percent: 0.25, label: "Target: 25" },
    { percent: 0.35, label: "Base: 35", color: "#999999" },
  ]}
/>
```

#### Chart with arc labels written on the arcs

```jsx
<GaugeChart id="gauge-chart9"
  nrOfLevels={3}
  percent={0.62}
  arcLabels={["Low", "Medium", "High"]}
  showArcLabels
/>
```

#### Chart with the needle kept inside the arc

```jsx
<GaugeChart id="gauge-chart10"
  percent={1.25}
  clampNeedle
/>
```

#### Chart with a custom value text

```jsx
<GaugeChart id="gauge-chart11"
  percent={0.4567}
  formatTextValue={(value, percent) => `${(percent * 120).toFixed(1)} km/h`}
/>
```

#### Chart with a longer needle

```jsx
<GaugeChart id="gauge-chart12"
  percent={0.7}
  needleScale={0.8}
/>
```

# Demo
https://martin36.github.io/react-gauge-chart/

# API

## <GaugeChart />

### Warning: Do not use the same `id` for multiple charts, as it will put multiple charts in the same container

#### Note: If you do any updates to the props of the chart, it will rerender with a different size (it's a bug). To prevent this set a fixed height for the chart e.g.

```jsx
const chartStyle = {
  height: 250,
}

<GaugeChart id="gauge-chart1" style={chartStyle} />

```

Fixed in 0.6.0: the chart now keeps the same size when its props change or the window is resized, so the fixed height is only needed on older versions.

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
| fontSize        | PropTypes.string            | The font size of the text                                      | none              |
| needleColor     | PropTypes.string            | The color of the needle triangle                               | "#464A4F"              |
| needleBaseColor | PropTypes.string            | The color of the circle at the base of the needle              | "#464A4F"              |
| hideText        | PropTypes.bool              | Whether or not to hide the percentage display                  | false                  |
| arcsLength      | PropTypes.array             | An array specifying the length of each individual arc. If this prop is set, the nrOfLevels prop will have no effect      | none                   |
| animate         | PropTypes.bool              | Whether or not to animate the needle when loaded               | true                   |
| animDelay       | PropTypes.number            | Delay in ms before starting the needle animation               | 500                    |
| animateDuration       | PropTypes.number            | Duration in ms for the needle animation               | 3000                    |
| formatTextValue | PropTypes.func              | Format you own text value (example: value => value+'%'). Receives the value as a percentage rounded to 2 decimals, and as a second argument the unrounded percent (0 to 1) as passed in (example: (value, percent) => (percent * 120).toFixed(1) + ' km/h') | null                   |
| textComponent   | PropTypes.elements          | Custom text label textComponent                                | null                   |
| textComponentContainerClassName | PropTypes.string | Add `className` to the text component container           |                        |
| needleScale     | PropTypes.number            | Length of the needle as a share of the arc's outer radius. Raise it to bring the tip closer to the arc; `1 - arcWidth` (0.8 with the default `arcWidth`) makes it reach the inner edge of the arc | 0.55                   |
| clampNeedle     | PropTypes.bool              | Stop the needle at the ends of the arc when `percent` is below 0 or above 1. The text still shows the value as given | false |
| customNeedleComponent | PropTypes.element     | Custom needle component `Note: Make sure to rotate the needle as per the percentage value` | null |
| customNeedleComponentClassName | PropTypes.string | Add `className` to the custom needle container             |                        |
| customNeedleStyle | PropsTypes.object         | Add `style` to custom needle container div                     |                        |
| arcLabels       | PropTypes.array             | Text shown as a tooltip when hovering each arc, in the same order as the arcs (e.g. `["Low", "Medium", "High"]`) | none |
| showArcLabels   | PropTypes.bool              | Also write each of `arcLabels` on its arc, in `textColor`. Style them with the `.arc-label` class (e.g. `font-size`, `fill`) | false |
| needleTooltip   | PropTypes.bool \| PropTypes.func | Show the current value as a tooltip when hovering the needle. `true` uses the same text as the value display (including `formatTextValue`); a function receives the percent (0 to 1) and returns the text | false |
| referenceLines  | PropTypes.array             | Lines drawn across the arc to mark values such as a target or a baseline. Each item is `{ percent, label, color, width }`, where `percent` is between 0 and 1 and the rest are optional (`color` defaults to `textColor`, `width` to 2). Labels are drawn just outside the arc, so leave some space around the chart | none |
|

##### Colors for the chart

The colors could either be specified as an array of hex color values, such as `["#FF0000", "#00FF00", "#0000FF"]` where
each arc would a color in the array (colors are assigned from left to right). If that is the case, then the **length of the array**
must match the **number of levels** in the arc.
If the number of colors does not match the number of levels, then the **first** and the **last** color from the colors array will
be selected and the arcs will get colors that are interpolated between those. The interpolation is done using [d3.interpolateHsl](https://github.com/d3/d3-interpolate#interpolateHsl).
