import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute } from './utils/PrivateRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import UploadPaper from './pages/UploadPaper';
import LandingPageV1b from './pages/LandingPageV1b';
import DepartmentalClash from './pages/DepartmentalClash';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserCollections from './pages/UserCollections';
import Profile from './pages/Profile';
import Preferences from './pages/Preferences';
import Security from './pages/Security';

import './index.css';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-bg-light">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public - no sidebar */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/v1b" element={<LandingPageV1b />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/leaderboard" element={<AppLayout><DepartmentalClash /></AppLayout>} />


          {/* Authenticated - with sidebar */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout><Dashboard /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <PrivateRoute>
                <AppLayout><Preferences /></AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/downloads"
            element={
              <PrivateRoute>
                <AppLayout><UserCollections /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/uploads"
            element={
              <PrivateRoute>
                <AppLayout><UserCollections /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <AppLayout><UserCollections /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/upload/new"
            element={
              <PrivateRoute>
                <AppLayout><UploadPaper /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <PrivateRoute>
                <AppLayout><UserCollections /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <AppLayout><Profile /></AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/security"
            element={
              <PrivateRoute>
                <AppLayout><Security /></AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/preferences"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
