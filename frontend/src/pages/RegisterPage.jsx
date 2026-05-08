import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [semester, setSemester] = useState('');
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState('register'); // 'register' | 'verify'
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        api.get('/papers/departments').then((res) => setDepartments(res.data.departments)).catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, departmentId, phoneNumber, semester);
            setStep('verify');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }
        setVerifying(true);
        setError('');
        try {
            const res = await api.post('/auth/verify-email', { email, code: otp });
            // Verification successful, update local user state if needed or redirect
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        setResendStatus('');
        try {
            await api.post('/auth/resend-otp', { email });
            setResendStatus('New code sent to your email');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    const handleGoogleSuccess = useCallback(async (credentialResponse) => {
        setGoogleLoading(true);
        setError('');
        try {
            const loggedInUser = await googleLogin(credentialResponse.credential, 'register');
            // New Google users won't have department/semester — send them to complete profile
            if (!loggedInUser.department_id || !loggedInUser.semester) {
                navigate('/profile?complete=1');
            } else {
                navigate(loggedInUser.role === 'student' ? '/dashboard' : '/sector-delta');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Google sign-up failed');
        } finally {
            setGoogleLoading(false);
        }
    }, [googleLogin, navigate]);

    const handleGoogleError = useCallback(() => {
        setError('Google sign-up was cancelled or failed. Please try again.');
    }, []);

    return (
        <div className="min-h-screen flex">
            {/* Left decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
                <div className="absolute top-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-60 h-60 bg-landing-orange/15 rounded-full blur-3xl" />
                <div className="relative z-10 text-center text-white px-12">
                    <Link to="/" className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-8 overflow-hidden p-4 hover:scale-105 transition-transform cursor-pointer">
                        <img src="/logo.png" alt="Knowledge Hub Logo" className="w-full h-full object-contain" />
                    </Link>
                    <h2 className="font-display text-4xl font-extrabold mb-4">
                        {step === 'register' ? 'Join Knowledge Hub' : 'Verify Your Identity'}
                    </h2>
                    <p className="text-white/70 text-lg max-w-sm mx-auto">
                        {step === 'register'
                            ? 'Create your account, upload papers, and start earning reputation points.'
                            : 'We\'ve sent a 6-digit verification code to your email. Please enter it to activate your account.'}
                    </p>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-main">
                <div className="w-full max-w-md">
                    <Link to="/" className="lg:hidden flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity cursor-pointer">
                        <img src="/logo.png" alt="Knowledge Hub Logo" className="w-10 h-10 object-contain" />
                        <span className="font-display text-xl font-bold text-primary">Knowledge Hub</span>
                    </Link>

                    {step === 'register' ? (
                        <>
                            <h1 className="font-display text-3xl font-bold text-main mb-2">Create Account</h1>
                            <p className="text-muted mb-6">Fill in your details to get started</p>

                            {error && (
                                <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Google Sign-Up Button */}
                            <div className="mb-5">
                                {googleLoading ? (
                                    <div className="w-full py-3.5 rounded-xl border border-main bg-surface flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                                        <span className="text-sm font-medium text-muted">Creating account with Google...</span>
                                    </div>
                                ) : (
                                    <div className="google-login-wrapper flex justify-center">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            size="large"
                                            width="400"
                                            text="signup_with"
                                            shape="pill"
                                            theme="outline"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="relative mb-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-main"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-4 bg-main text-muted font-medium uppercase tracking-wider">or register with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-main mb-2">Full Name</label>
                                    <input
                                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe" required
                                        className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-main mb-2">Email</label>
                                    <input
                                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@university.edu" required
                                        className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-main mb-2">Password</label>
                                    <input
                                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 8 characters" required minLength={8}
                                        className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                    />
                                    <p className="text-[11px] text-muted mt-1.5 px-1">
                                        Must include uppercase, lowercase, and numbers.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-main mb-2">Phone Number</label>
                                        <input
                                            type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="1234567890" required
                                            className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-main mb-2">Semester</label>
                                        <select
                                            value={semester} onChange={(e) => setSemester(e.target.value)} required
                                            className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                        >
                                            <option value="">Select</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                <option key={s} value={s}>Semester {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-main mb-2">Department</label>
                                    <select
                                        value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required
                                        className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit" disabled={loading || googleLoading}
                                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50 mt-2"
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-8">
                                Already have an account?{' '}
                                <Link to="/login" className="text-accent font-semibold hover:underline">Sign In</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <button
                                    onClick={() => setStep('register')}
                                    className="flex items-center gap-1 text-sm font-bold text-accent hover:underline mb-6"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                    Back to details
                                </button>
                                <h1 className="font-display text-3xl font-bold text-main mb-2">Check your email</h1>
                                <p className="text-muted">We sent a 6-digit code to <span className="text-main font-semibold">{email}</span></p>
                            </div>

                            {error && (
                                <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            {resendStatus && (
                                <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 text-green-600 text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    {resendStatus}
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-6">
                                <div>
                                    <label className="block text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Verification Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="······"
                                        className="w-full text-center px-4 py-4 rounded-xl border-2 border-main bg-main text-main text-3xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent focus:bg-surface transition-all placeholder:text-muted"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit" disabled={verifying}
                                    className="w-full py-4 bg-accent text-white font-bold rounded-xl text-sm hover:bg-accent-dark transition-all duration-200 shadow-xl shadow-accent/20 disabled:opacity-50"
                                >
                                    {verifying ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </form>

                            <div className="text-center mt-10">
                                <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="text-primary font-bold hover:underline disabled:opacity-40"
                                >
                                    {resending ? 'Resending...' : 'Click to resend'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
