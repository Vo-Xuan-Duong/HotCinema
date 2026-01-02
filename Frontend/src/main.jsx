import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';
// import './styles/floating-buttons-global.css';
// import './styles/select-fix.css';
// import './styles/antd-tailwind-compat.css';
// import './styles/antd-components-fix.css';
// import './utils/suppressAntdWarnings';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
