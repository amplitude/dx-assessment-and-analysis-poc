import React from 'react';
// import logo from './logo.svg';
import logo from './assets/amplitude_logo.png';
import './App.css';

/**
 * Import strongly typed SDKs for convenience
 */
import { amplitude, user, analytics, experiment, UserLoggedIn, Logger } from '../src/amplitude/browser';

amplitude.data.load({
  environment: 'production',
  logger: new Logger(),
  plugins: [
    analytics,
    experiment
  ]
})

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Unified SDK - Proof of Concept
        </p>
        <div className="section-group">
          <div className="section">
            <span>Experiment</span>
            <button onClick={() => experiment.exposure()}>experiment.exposure()</button>
          </div>
          <div className="section">
            <span>Analytics</span>
            <button onClick={() => analytics.data.userLoggedIn()}>Login (with Event method)</button>
            <button onClick={() => analytics.track(new UserLoggedIn())}>Login (with Event class)</button>
            <button onClick={() => analytics.data.userSignedUp()}>Sign Up</button>
          </div>
          <div className="section">
            <span>User</span>
            <button onClick={() => user.setUserId('user-id')}>Set User Id</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
