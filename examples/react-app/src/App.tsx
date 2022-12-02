import React from 'react';
import logo from './assets/amplitude_logo.png';
import './App.css';

/**
 * Import strongly typed SDKs for convenience
 */
import { amplitude, user, analytics, experiment, UserLoggedIn, Logger, NoLogger } from './amplitude';
import { getProductConfigurationFromEnv } from "@amplitude/util";

const { REACT_APP_LOGGING_DISABLED } = process.env;
const useLogger = REACT_APP_LOGGING_DISABLED !== 'true';

amplitude.typed.load({
  environment: 'development',
  logger: useLogger ? new Logger() : new NoLogger(),
  // Try reading in ApiKeys from .env file
  ...getProductConfigurationFromEnv(true),
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
            }}>experiment.typed.codegenBooleanExperiment()</button>
            <button onClick={() => {
              console.log(experiment.typed.codegenArrayExperiment().generic?.payload);
            }}>experiment.typed.codegenArrayExperiment().generic.payload</button>
            <button onClick={() => {
              console.log(experiment.typed.codegenArrayExperiment().ampli?.payload);
            }}>experiment.typed.codegenArrayExperiment().ampli.payload</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
