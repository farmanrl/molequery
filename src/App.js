import React, { Component } from 'react';
import Query from './Query';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">MoleQuery</h1>
          </header>
          <h1>TIRED OF WASTING TIME WRITING CHEMICAL FORMULAS?</h1>
          <h2>Type once, and never again. Create your own molecule collection.</h2>
          <h6>Be gentle with the amount of queries you make. I'm limited to 1000 per month.</h6>
          <strong className="App-intro">
            Enter in the formula for a molecule you'd like to query.
          </strong>
        </div>
        <br />
        <Query />
      </div >
    );
  }
}

export default App;
