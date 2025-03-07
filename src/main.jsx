import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Callback from './components/Callback';
import { GitLabProvider } from './context/GitLabContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GitLabProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth/callback" element={<Callback />} />
        </Routes>
      </Router>
    </GitLabProvider>
  </React.StrictMode>
);