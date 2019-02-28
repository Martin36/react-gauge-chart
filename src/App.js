import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import GaugeChart from './lib';

class App extends Component {
  render() {
    return (
      <>
      <Container>
        <Row>
          <Col xs={12} lg={{offset: 2, span: 8}}>
            <h1>React Gauge Chart</h1>
          </Col>
        </Row>  
        <Row>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with default props</h6>
            <GaugeChart id="gauge-chart1" />
          </Col>
          <Col xs={12} lg={6}>
            <h6>GaugeChart with 20 levels</h6>
            <GaugeChart id="gauge-chart2" nrOfLevels={20} />
          </Col>
        </Row>
      </Container>

      </>
    );
  }
}

export default App;
