import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute } from './utils/PrivateRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './index.css';


const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UploadPaper = lazy(() => import('./pages/UploadPaper'));
const DepartmentalClash = lazy(() => import('./pages/DepartmentalClash'));
const ContributorLeaderboard = lazy(() => import('./pages/ContributorLeaderboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserCollections = lazy(() => import('./pages/UserCollections'));
const Profile = lazy(() => import('./pages/Profile'));
const Preferences = lazy(() => import('./pages/Preferences'));
const Security = lazy(() => import('./pages/Security'));
const Tutorial = lazy(() => import('./pages/Tutorial'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));


const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-bg-light/50 backdrop-blur-md">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p className="text-text-muted text-sm font-medium animate-pulse">Initializing KnowledgeHub...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public - no sidebar */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/leaderboard" element={<AppLayout><DepartmentalClash /></AppLayout>} />
            <Route path="/contributors" element={<AppLayout><ContributorLeaderboard /></AppLayout>} />

            {/* Authenticated - with sidebar */}
            <Route
              path="/dashboard"
              element={
                <AppLayout><Dashboard /></AppLayout>
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
              path="/nituganesh/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/nituganesh/preferences"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/tutorial"
              element={
                <AppLayout><Tutorial /></AppLayout>
              }
            />
            <Route
              path="/about"
              element={
                <AppLayout><About /></AppLayout>
              }
            />
            <Route
              path="/privacy"
              element={
                <AppLayout><PrivacyPolicy /></AppLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <AppLayout><TermsOfService /></AppLayout>
              }
            />

            {/* Catch-all: 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
