# Changelog

## 0.6.0

All changes are backward compatible. New props are opt-in and default to the previous behaviour.

### Fixes

- The chart no longer re-initialises, and the needle no longer restarts from 0, when the parent re-renders ([#240](https://github.com/Martin36/react-gauge-chart/pull/240), fixes [#81](https://github.com/Martin36/react-gauge-chart/issues/81))
- The chart keeps a consistent size when the window or its container resizes, and now follows its container's width, e.g. in a sidebar, tab or grid ([#247](https://github.com/Martin36/react-gauge-chart/pull/247), fixes [#27](https://github.com/Martin36/react-gauge-chart/issues/27))
- No crash when rendered without a DOM container, e.g. with react-test-renderer ([#241](https://github.com/Martin36/react-gauge-chart/pull/241), fixes [#85](https://github.com/Martin36/react-gauge-chart/issues/85))
- The needle stays at its start value until the animation starts ([#245](https://github.com/Martin36/react-gauge-chart/pull/245), fixes [#112](https://github.com/Martin36/react-gauge-chart/issues/112))
- Removed the undeclared `lodash` import ([#237](https://github.com/Martin36/react-gauge-chart/pull/237), fixes [#122](https://github.com/Martin36/react-gauge-chart/issues/122))

### New props

- `arcLabels` and `needleTooltip`: tooltips on the arcs and the needle ([#238](https://github.com/Martin36/react-gauge-chart/pull/238), [#130](https://github.com/Martin36/react-gauge-chart/issues/130))
- `referenceLines`: mark a target or baseline on the arc ([#239](https://github.com/Martin36/react-gauge-chart/pull/239), [#170](https://github.com/Martin36/react-gauge-chart/issues/170))
- `clampNeedle`: keep the needle at the ends for values outside 0–1 ([#243](https://github.com/Martin36/react-gauge-chart/pull/243), [#41](https://github.com/Martin36/react-gauge-chart/issues/41))
- `showArcLabels`: write the arc labels on the arcs ([#244](https://github.com/Martin36/react-gauge-chart/pull/244), [#43](https://github.com/Martin36/react-gauge-chart/issues/43))
- `formatTextValue` now also receives the raw value as a second argument ([#242](https://github.com/Martin36/react-gauge-chart/pull/242), [#89](https://github.com/Martin36/react-gauge-chart/issues/89))

### Docs

- `needleScale` is documented as the needle length ([#246](https://github.com/Martin36/react-gauge-chart/pull/246), [#90](https://github.com/Martin36/react-gauge-chart/issues/90))
