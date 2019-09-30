import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import './App.css'
import GaugeChart from './lib'

const App = () => {
	const [currentPercent, setCurrentPercent] = useState();

	useEffect(() => {
		const timer = setTimeout(() => {
			setCurrentPercent(Math.random());
		}, Math.random() * 3000);

		return () => {
			clearTimeout(timer);
		};
	});

	const chartStyle = {
		height: 250,
	}

  return (
    <>
      <Container>
        <Row>
          <Col xs={12} lg={{ offset: 2, span: 8 }}>
            <h1>React Gauge Chart Demo</h1>
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with default props</h6>
            <GaugeChart id="gauge-chart1" style={chartStyle} />
          </Col>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with 20 levels</h6>
            <GaugeChart
							id="gauge-chart2"
							style={chartStyle}
							nrOfLevels={20}
							percent={0.86}
							needleColor="#345243"
						/>
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with custom colors</h6>
            <GaugeChart
              id="gauge-chart3"
							style={chartStyle}
              nrOfLevels={30}
              colors={['#FF5F6D', '#FFC371']}
              arcWidth={0.3}
              percent={0.37}
            />
          </Col>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with larger padding between elements</h6>
            <GaugeChart
							id="gauge-chart4"
							style={chartStyle}
							nrOfLevels={10}
							arcPadding={0.1}
							cornerRadius={3}
							percent={0.6}
						/>
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with custom arcs width</h6>
            <GaugeChart
              id="gauge-chart5"
							style={chartStyle}
              nrOfLevels={420}
              arcsLength={[0.3, 0.5, 0.2]}
              colors={['#5BE12C', '#F5CD19', '#EA4228']}
              percent={0.37}
              arcPadding={0.02}
            />
          </Col>
          <Col xs={12} lg={6}>
            <h6>GaugeChart without animation</h6>
            <GaugeChart
              id="gauge-chart6"
							style={chartStyle}
              animate={false}
              nrOfLevels={15}
              percent={0.56}
              needleColor="#345243"
            />
          </Col>
        </Row>
				<Row>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with live updates</h6>
            <GaugeChart
							id="gauge-chart7"
							style={chartStyle}
              percent={currentPercent}
            />
          </Col>
          <Col xs={12} lg={6} />
        </Row>
      </Container>
    </>
  )
};

export default App;
