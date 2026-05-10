import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();


    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [attemptsRemaining, setAttemptsRemaining] = useState(3);


    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSuccess(res.data.message);
            setAttemptsRemaining(3);
            setOtpCode('');
            setStep('otp');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-reset-otp', { email, code: otpCode });
            setResetToken(res.data.reset_token);
            setSuccess('Code verified! Set your new password.');
            setStep('reset');
        } catch (err) {
            const data = err.response?.data || {};


            if (data.locked) {
                setError('');
                setSuccess('');
                setOtpCode('');
                setAttemptsRemaining(0);

                setError('Too many wrong attempts. Your code has been invalidated.');
                setTimeout(() => {
                    setStep('email');
                    setError('');
                    setAttemptsRemaining(3);
                    setSuccess('Please request a new reset code.');
                }, 3000);
            } else {

                if (data.attempts_remaining !== undefined) {
                    setAttemptsRemaining(data.attempts_remaining);
                }
                setOtpCode('');
                setError(data.error || 'Invalid code');
            }
        } finally {
            setLoading(false);
        }
    };


    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');


        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setError('Password must contain at least one uppercase letter');
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            setError('Password must contain at least one lowercase letter');
            return;
        }
        if (!/\d/.test(newPassword)) {
            setError('Password must contain at least one digit');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email,
                reset_token: resetToken,
                new_password: newPassword,
            });
            setSuccess('');
            setStep('done');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };


    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess('A new code has been sent to your email.');
            setAttemptsRemaining(3);
            setOtpCode('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const stepConfig = {
        email: { icon: 'mail', title: 'Forgot Password', subtitle: 'Enter your registered email and we\'ll send you a reset code.' },
        otp: { icon: 'pin', title: 'Enter Reset Code', subtitle: `We sent a 6-digit code to ${email}` },
        reset: { icon: 'lock_reset', title: 'Set New Password', subtitle: 'Choose a strong password for your account.' },
        done: { icon: 'check_circle', title: 'Password Reset!', subtitle: 'Your password has been changed successfully.' },
    };

    const current = stepConfig[step];

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
                    <h2 className="font-display text-4xl font-extrabold mb-4">Reset Access</h2>
                    <p className="text-white/70 text-lg max-w-sm mx-auto">
                        Don't worry — we'll help you recover your account in just a few steps.
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

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {['email', 'otp', 'reset'].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === s || ['otp', 'reset', 'done'].indexOf(step) > i - 1
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-surface border border-main text-muted'
                                    }`}>
                                    {['otp', 'reset', 'done'].indexOf(step) > i ? (
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                {i < 2 && <div className={`w-8 h-0.5 transition-all duration-300 ${['otp', 'reset', 'done'].indexOf(step) > i ? 'bg-primary' : 'bg-border-main'
                                    }`} />}
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`material-symbols-outlined text-3xl ${step === 'done' ? 'text-green-500' : 'text-primary'}`}>
                            {current.icon}
                        </span>
                        <h1 className="font-display text-3xl font-bold text-main">{current.title}</h1>
                    </div>
                    <p className="text-muted mb-8">{current.subtitle}</p>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && step !== 'done' && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-green-500/10 text-green-500 text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            {success}
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
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
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-main mb-2">6-Digit Code</label>
                                <input
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-2xl text-center tracking-[0.5em] font-mono placeholder:text-muted placeholder:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                />
                            </div>

                            {/* Attempts remaining badge */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${attemptsRemaining <= 1
                                ? 'bg-danger/10 text-danger border border-danger/20'
                                : 'bg-surface border border-main text-muted'
                                }`}>
                                <span className="material-symbols-outlined text-sm">
                                    {attemptsRemaining <= 1 ? 'warning' : 'shield'}
                                </span>
                                {attemptsRemaining === 0
                                    ? 'Code invalidated. Redirecting...'
                                    : `${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining`
                                }
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otpCode.length !== 6}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="w-full py-2.5 text-accent text-sm font-semibold hover:underline disabled:opacity-50"
                            >
                                Didn't receive the code? Resend
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-main mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        required
                                        minLength={6}
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
                            <div>
                                <label className="block text-sm font-medium text-main mb-2">Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 rounded-xl border border-main bg-surface text-main text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                                />
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-danger text-xs font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    Passwords do not match
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={loading || !newPassword || newPassword !== confirmPassword}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Done */}
                    {step === 'done' && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-5xl text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                            </div>
                            <p className="text-muted">Your password has been updated. You can now sign in with your new credentials.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-light transition-all duration-200 shadow-lg shadow-primary/20"
                            >
                                Go to Sign In
                            </button>
                        </div>
                    )}

                    {/* Back to login */}
                    {step !== 'done' && (
                        <p className="text-center text-sm text-gray-500 mt-8">
                            Remember your password?{' '}
                            <Link to="/login" className="text-accent font-semibold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
