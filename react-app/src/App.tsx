import React from 'react';
import logo from './logo.svg';
import './App.css';

/**
 * Usage Examples
 *
 * Uncomment the individual usages to see output in console
 */
import './usage/coreSdkUsage';
// import './usage/typedSdkUsage';
// import './usage/coreToTypedSdkUsage';
// import './usage/productPlugins';
// import './usage/multiTenantUser';

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
