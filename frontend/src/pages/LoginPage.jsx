import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
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

                        <button
                            type="submit"
                            disabled={loading}
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
        </div>
    );
}
