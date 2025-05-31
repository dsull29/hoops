// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assuming your main App component is App.tsx
import 'antd/dist/reset.css'; // Import AntD styles
import './index.css'; // Or your global stylesheet

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);