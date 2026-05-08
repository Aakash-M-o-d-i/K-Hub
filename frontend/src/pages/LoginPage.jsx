import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showNoAccountModal, setShowNoAccountModal] = useState(false);
    const { login, googleLogin, user } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(user.role === 'student' ? '/dashboard' : '/sector-delta');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            navigate(loggedInUser.role === 'student' ? '/dashboard' : '/sector-delta');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = useCallback(async (credentialResponse) => {
        setGoogleLoading(true);
        setError('');
        try {
            const loggedInUser = await googleLogin(credentialResponse.credential, 'login');
            if (!loggedInUser.department_id || !loggedInUser.semester) {
                navigate('/profile?complete=1');
            } else {
                navigate(loggedInUser.role === 'student' ? '/dashboard' : '/sector-delta');
            }
        } catch (err) {
            // If backend says user doesn't exist, show the popup modal
            if (err.response?.data?.redirect === 'register') {
                setShowNoAccountModal(true);
                return;
            }
            setError(err.response?.data?.error || 'Google sign-in failed');
        } finally {
            setGoogleLoading(false);
        }
    }, [googleLogin, navigate]);

    const handleGoogleError = useCallback(() => {
        setError('Google sign-in was cancelled or failed. Please try again.');
    }, []);

    return (
        <div className="min-h-screen flex">
            {/* Left: decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
                <div className="absolute top-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-landing-orange/15 rounded-full blur-3xl" />
                <div className="relative z-10 text-center text-white px-12">
                    <Link to="/" className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-8 overflow-hidden p-4 hover:scale-105 transition-transform">
                        <img src="/logo.png" alt="Knowledge Hub Logo" className="w-full h-full object-contain" />
                    </Link>
                    <h2 className="font-display text-4xl font-extrabold mb-4">Welcome Back</h2>
                    <p className="text-white/70 text-lg max-w-sm mx-auto">
                        Access your academic papers, track your contributions, and climb the leaderboard.
                    </p>
                </div>
            </div>

            {/* Right: form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-main">
                <div className="w-full max-w-md">
                    <Link to="/" className="lg:hidden flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Knowledge Hub Logo" className="w-10 h-10 object-contain" />
                        <span className="font-display text-xl font-bold text-primary">Knowledge Hub</span>
                    </Link>

                    <h1 className="font-display text-3xl font-bold text-main mb-2">Sign In</h1>
                    <p className="text-muted mb-8">Enter your credentials to access your account</p>

                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    <div className="mb-6">
                        {googleLoading ? (
                            <div className="w-full py-3.5 rounded-xl border border-main bg-surface flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                                <span className="text-sm font-medium text-muted">Signing in with Google...</span>
                            </div>
                        ) : (
                            <div className="google-login-wrapper flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    size="large"
                                    width="400"
                                    text="continue_with"
                                    shape="pill"
                                    theme="outline"
                                />
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-main"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-main text-muted font-medium uppercase tracking-wider">or sign in with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-main mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@university.edu"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-main mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm text-accent font-medium hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm
                hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-accent font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>

            {/* ─── No Account Found Modal (Spotify-style) ─── */}
            {showNoAccountModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowNoAccountModal(false)}
                        style={{ animation: 'noAcctFadeIn 0.2s ease-out' }}
                    />
                    <div
                        className="relative bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                        style={{ animation: 'noAcctScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-primary">person_search</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                No Account Found
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                This Google account isn't connected to a<br />
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Knowledge Hub</span> account.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full py-3.5 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => setShowNoAccountModal(false)}
                                    className="w-full py-3.5 bg-transparent text-gray-700 dark:text-gray-300 font-bold rounded-full text-sm border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200"
                                >
                                    Log in another way
                                </button>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes noAcctFadeIn { from { opacity: 0 } to { opacity: 1 } }
                        @keyframes noAcctScaleIn { from { opacity: 0; transform: scale(0.9) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
                    `}</style>
                </div>
            )}
        </div>
    );
}
