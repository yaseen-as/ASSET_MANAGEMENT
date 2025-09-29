import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import { store, AppDispatch } from './store/store';
import { initializeAuth } from './store/slices/authSlice';
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

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialize auth state when app starts
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
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
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
        {/* Global Sonner Toast Container */}
        <Toaster 
          position="top-right" 
          closeButton 
          richColors 
          theme="dark"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              border: '1px solid #333',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
