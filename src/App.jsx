import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';

// Tablet App Components
import TabletAppLayout from './components/TabletApp/TabletAppLayout';
import WelcomeScreen from './components/TabletApp/WelcomeScreen';
import PhoneEntryScreen from './components/TabletApp/PhoneEntryScreen';
import RegistrationScreen from './components/TabletApp/RegistrationScreen';
import PointsConfirmationScreen from './components/TabletApp/PointsConfirmationScreen';
import RewardRedemptionScreen from './components/TabletApp/RewardRedemptionScreen'; // ✅ Make sure this file ends with: export default RewardRedemptionScreen;

// Admin Dashboard Components
import AdminLayout from './components/AdminDashboard/AdminLayout';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import CustomerDatabase from './components/AdminDashboard/CustomerDatabase';
import RewardsSettings from './components/AdminDashboard/RewardsSettings';
import PromotionsManagement from './components/AdminDashboard/PromotionsManagement';
import ReportsAnalytics from './components/AdminDashboard/ReportsAnalytics';
import Settings from './components/AdminDashboard/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Tablet App Routes */}
          <Route path="/tablet" element={<TabletAppLayout />}>
            <Route index element={<WelcomeScreen />} />
            <Route path="phone-entry" element={<PhoneEntryScreen />} />
            <Route path="register" element={<RegistrationScreen />} />
            <Route path="confirmation" element={<PointsConfirmationScreen />} />
            <Route path="points-confirmation" element={<PointsConfirmationScreen />} />
            <Route path="redeem-rewards" element={<RewardRedemptionScreen />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerDatabase />} />
            <Route path="rewards" element={<RewardsSettings />} />
            <Route path="promotions" element={<PromotionsManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* App Selection Route */}
          <Route
            path="/"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                  <h1 className="text-2xl font-bold text-center mb-6">Loyalty Rewards App</h1>
                  <div className="space-y-4">
                    <Link
                      to="/tablet"
                      className="flex items-center justify-center p-4 w-full border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="text-lg font-medium text-center">Tablet Mode</div>
                        <div className="text-sm text-gray-500 text-center">For customer-facing interactions</div>
                      </div>
                    </Link>

                    <Link
                      to="/admin"
                      className="flex items-center justify-center p-4 w-full border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      <div>
                        <div className="text-lg font-medium text-center">Admin Dashboard</div>
                        <div className="text-sm text-gray-500 text-center">Manage your loyalty program</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            }
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
