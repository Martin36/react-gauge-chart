import React, {Component} from 'react'
import {Col, Container, Row} from 'react-bootstrap'
import './App.css'
import GaugeChart from './lib'

class App extends Component {

    state = {
        lines: 20
    }

    componentDidMount() {
        this.intervalID = setInterval(() => {
            if (this.state.lines > 25) {
                clearInterval(this.intervalID)
            } else {
                this.setState({
                    lines: this.state.lines + 1
                })
            }
            
        }, 1000)
    }

    render() {
        return (
            <>
                <Container>
                    <Row>
                        <Col xs={12} lg={{offset: 2, span: 8}}>
                            <h1>React Gauge Chart Demo</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={6}>
                            <h6>GaugeChart with default props</h6>
                            <GaugeChart id="gauge"/>
                        </Col>
                        <Col xs={12} lg={6}>
                            <h6>GaugeChart with {this.state.lines} levels</h6>
                            <GaugeChart id="gauge123" nrOfLevels={this.state.lines} percent={0.6}
                                        needleColor="#345243"/>
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
                            <GaugeChart id="gauge-chart4" nrOfLevels={10} arcPadding={0.1} cornerRadius={3}
                                        percent={0.6}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={6}>
                            <h6>GaugeChart with custom arcs width</h6>
                            <GaugeChart
                                id="gauge-chart5"
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
                                animate={false}
                                nrOfLevels={15}
                                percent={0.56}
                                needleColor="#345243"
                            />
                        </Col>
                    </Row>
                </Container>
            </>
        )
    }
}

export default App
