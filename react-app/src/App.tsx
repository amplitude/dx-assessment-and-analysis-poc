import React from 'react';
import logo from './logo.svg';
import './App.css';

/**
 * Usage Examples
 *
 * Uncomment the individual examples to see output in console
 */
// import './examples/1-core-sdk-usage';
// import './examples/2-typed-sdk-usage';
// import './examples/3-core-to-typed-sdk';
// import './examples/4-product-plugins';
// import './examples/5-multiple-users-on-a-server';
// import './examples/6-cross-platform-usage';
import './examples/7-cross-plugin-communication';
// import './examples/8-plugin-configuration';

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
