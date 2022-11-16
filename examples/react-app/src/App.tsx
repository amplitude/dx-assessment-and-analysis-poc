import React from 'react';
import logo from './assets/amplitude_logo.png';
import './App.css';

/**
 * Import strongly typed SDKs for convenience
 */
import { amplitude, user, analytics, experiment, UserLoggedIn, Logger, NoLogger } from './amplitude';

const { REACT_APP_LOGGING_DISABLED } = process.env;
const useLogger = REACT_APP_LOGGING_DISABLED !== 'true';

// Try reading in ApiKeys from .env file
let { REACT_APP_AMP_ANALYTICS_API_KEY, REACT_APP_AMP_EXPERIMENT_API_KEY } = process.env;

const envConfig = !(REACT_APP_AMP_ANALYTICS_API_KEY || REACT_APP_AMP_EXPERIMENT_API_KEY)
  ? {}
  : {
    configuration: {
      analytics: {
        apiKey: REACT_APP_AMP_ANALYTICS_API_KEY,
      },
      experiment: {
        apiKey: REACT_APP_AMP_EXPERIMENT_API_KEY,
      },
    }
  };

amplitude.typed.load({
  environment: 'development',
  logger: useLogger ? new Logger() : new NoLogger(),
  ...envConfig,
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
            <span>User</span>
            <button onClick={() => user.setUserId('alpha-user-id')}>Set User Id (generic)</button>
            <button onClick={() => user.setUserId('alpha-codegen-user-id')}>Set User Id (codegen)</button>
            <button onClick={() => user.typed.setUserProperties({
              favoriteSongCount: 1,
              referralSource: 'twitter'
            })}>Set User Properties</button>
          </div>
          <div className="section">
            <span>Analytics</span>
            <button onClick={() => analytics.typed.userLoggedIn({
              method: 'email'
            })}>Login (with Event method)</button>
            <button onClick={() => analytics.track(new UserLoggedIn({
              method: 'google'
            }))}>Login (with Event class)</button>
            <button onClick={() => analytics.typed.userSignedUp()}>Sign Up</button>
          </div>
          <div className="section">
            <span>Experiment</span>
            <button onClick={() => experiment.fetch()}>experiment.fetch()</button>
            <button onClick={() => experiment.exposure()}>experiment.exposure()</button>
            <button onClick={() => {
              console.log(`${
                experiment.typed.codegenBooleanExperiment().key
              } is ${
                experiment.typed.codegenBooleanExperiment().on ? 'on' : 'off'
              }`)
            }}>experiment.codegenBooleanExperiment()</button>
            <button onClick={() => {
              console.log(experiment.typed.codegenArrayExperiment().generic?.payload);
            }}>experiment.codegenArrayExperiment().generic.payload</button>
            <button onClick={() => {
              console.log(experiment.typed.codegenArrayExperiment().ampli?.payload);
            }}>experiment.codegenArrayExperiment().ampli.payload</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
