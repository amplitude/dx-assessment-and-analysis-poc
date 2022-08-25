import React from 'react';
import logo from './logo.svg';
import './App.css';

// import './usage/coreSdkUsage';
import './usage/coreToWrapperSdkUsage';
// import './usage/generatedSdkUsage';
// import './usage/productPlugins';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Amplitude SDK Unification - Proof of Concept
        </p>
      </header>
    </div>
  );
}

export default App;
