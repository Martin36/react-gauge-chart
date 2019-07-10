import React, { Component } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import './App.css'
import GaugeChart from './lib'

class App extends Component {
  render() {
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
              <GaugeChart id="gauge-chart1" />
            </Col>
            <Col xs={12} lg={6}>
              <h6>GaugeChart with 20 levels</h6>
              <GaugeChart id="gauge-chart2" nrOfLevels={20} percent={0.86} needleColor="#345243" />
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={6}>
              <h6>GaugeChart with custom colors</h6>
              <GaugeChart
                id="gauge-chart3"
                nrOfLevels={30}
                colors={['#FF5F6D', '#FFC371']}
                arcWidth={0.3}
                percent={0.37}
              />
            </Col>
            <Col xs={12} lg={6}>
              <h6>GaugeChart with larger padding between elements</h6>
              <GaugeChart id="gauge-chart4" nrOfLevels={10} arcPadding={0.1} cornerRadius={3} percent={0.6} />
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={6}>
              <h6>GaugeChart with custom arcs width</h6>
              <GaugeChart
                id="gauge-chart5"
                nrOfLevels={420}
                arcsWidth={[0.38, 0.42, 0.2]}
                colors={['#5BE12C', '#F5CD19', '#EA4228']}
                arcHeight={0.2}
                percent={0.37}
                arcPadding={0.02}
              />
            </Col>
          </Row>
        </Container>
      </>
    )
  }
}

export default App
