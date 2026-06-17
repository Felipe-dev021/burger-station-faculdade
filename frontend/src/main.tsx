import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { warmupServices } from './warmup';

warmupServices();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);