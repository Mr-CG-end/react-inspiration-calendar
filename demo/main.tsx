import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/index.css';
import DemoApp from './DemoApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element.');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>,
);
