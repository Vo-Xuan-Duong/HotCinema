import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/mocks/bootstrapMockApi';
import App from '@/App';
import './index.css';
import './styles/flat-ui-policy.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
