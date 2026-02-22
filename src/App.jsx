import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Help from './pages/Help';
import Matcher from './pages/Matcher';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
import Onboarding from './pages/Onboarding';
import MenteePreferences from './pages/MenteePreferences';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Sessions from './pages/Sessions';
import Availability from './pages/Availability';
import MyMentees from './pages/MyMentees';
import Settings from './pages/Settings';
import AIChatbot from './components/AIChatbot';
import ScrollToHash from './components/ScrollToHash';

const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #1e3a8a', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  // Block unverified email/password users — Google SSO users always have emailVerified = true
  // Mock accounts (@mentor.match) are also exempt from verification
  const isMockAccount = user.email?.toLowerCase().endsWith('@mentor.match');
  const isVerifyPage = location.pathname === '/verify';

  if (!user.emailVerified && !isMockAccount && !isVerifyPage) {
    return <Navigate to="/verify" />;
  }

  // If not onboarded, and not already on onboarding/verify pages, redirect to onboarding
  const isOnboardingFlow = ['/onboarding', '/verify', '/mentee-preferences'].includes(location.pathname);
  if (!profile?.onboarded && !isOnboardingFlow) {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

const MenteeOnlyRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (profile?.role === 'mentor') return <Navigate to="/my-mentees" />;
  return children;
};

const MentorOnlyRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (profile?.role === 'mentee') return <Navigate to="/discover" />;
  return children;
};

import logger from './utils/logger';

import ReminderManager from './components/ReminderManager';

function App() {
  React.useEffect(() => {
    logger.brand();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ScrollToHash />
          <Layout>
            <ReminderManager />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/discover" element={
                <MenteeOnlyRoute>
                  <Matcher />
                </MenteeOnlyRoute>
              } />
              <Route path="/my-mentees" element={
                <MentorOnlyRoute>
                  <MyMentees />
                </MentorOnlyRoute>
              } />
              <Route path="/help" element={<Help />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<EmailVerification />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/mentee-preferences" element={
                <ProtectedRoute>
                  <MenteePreferences />
                </ProtectedRoute>
              } />
              <Route path="/profile/:uid?" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/sessions" element={
                <ProtectedRoute>
                  <Sessions />
                </ProtectedRoute>
              } />
              <Route path="/availability" element={
                <ProtectedRoute>
                  <Availability />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
            <AIChatbot />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
