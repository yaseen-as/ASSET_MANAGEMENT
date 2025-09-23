import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PortfolioPage from './pages/PortfolioPage';
import MarketDataPage from './pages/MarketDataPage';
import ProfilePage from './pages/ProfilePage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TransactionsPage from './pages/TransactionsPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/portfolio" element={<PrivateRoute><Layout><PortfolioPage /></Layout></PrivateRoute>} />
            <Route path="/market-data" element={<PrivateRoute><Layout><MarketDataPage /></Layout></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><Layout><AlertsPage /></Layout></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Layout><AnalyticsPage /></Layout></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Layout><TransactionsPage /></Layout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
