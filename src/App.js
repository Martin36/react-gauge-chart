import React, { Component } from 'react';
import './App.css';
import GaugeChart from './lib';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <GaugeChart percent={0.6} />
        </header>
      </div>
    );
  }
}

export default App;
