import React from 'react';
import logo from './logo.svg';
import './App.css';

/**
 * Usage Examples
 *
 * Uncomment the individual examples to see output in console
 */
// import './examples/coreSdkUsage';
// import './examples/typedSdkUsage';
// import './examples/coreToTypedSdkUsage';
// import './examples/productPlugins';
// import './examples/multiTenantUser';
import './examples/cross-plugin-communication';

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
