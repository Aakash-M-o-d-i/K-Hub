import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Security() {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('auth');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Password State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const isPasswordOld = () => {
        if (!user?.security?.password_changed_at) return false;
        const lastChanged = new Date(user.security.password_changed_at);
        const now = new Date();
        const diffTime = Math.abs(now - lastChanged);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 90;
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/auth/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setMessage({ type: 'success', text: 'Password protocols updated successfully' });
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            await refreshUser();
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to update password protocol'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle2FA = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/toggle-2fa');
            await refreshUser();
            setMessage({ type: 'success', text: res.data.message });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to adjust security perimeter' });
        } finally {
            setLoading(false);
        }
    };

    const [sessions, setSessions] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (activeTab === 'sessions') {
            fetchSessions();
        } else if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/sessions');
            setSessions(res.data.sessions);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to synchronize identity nodes' });
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/security-history');
            setHistory(res.data.history);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to fetch security audit trail' });
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        if (!confirm('Are you sure you want to terminate this identity session?')) return;

        setLoading(true);
        try {
            await api.delete(`/auth/sessions/${sessionId}`);
            setMessage({ type: 'success', text: 'Session terminated successfully' });
            fetchSessions();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to terminate session' });
        } finally {
            setLoading(false);
        }
    };

    const handlePurgeAllSessions = async () => {
        if (!confirm('WARNING: This will revoke access from all devices except your current one. Proceed?')) return;

        setLoading(true);
        try {
            const res = await api.delete('/auth/sessions/purge');
            setMessage({ type: 'success', text: res.data.message });
            fetchSessions();
        } catch (err) {
            setMessage({ type: 'error', text: 'Universal purge failed' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main text-text-main custom-scrollbar">
            {/* Banner / Alert */}
            {isPasswordOld() && (
                <div className="bg-warning/10 border-b border-warning/20 px-6 py-3 flex items-center justify-center gap-3 animate-pulse">
                    <span className="material-symbols-outlined text-warning text-sm">priority_high</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-warning">
                        Action Required: Your password is over 90 days old. Update recommended.
                    </p>
                    <button
                        onClick={() => setActiveTab('auth')}
                        className="text-[10px] font-black uppercase tracking-widest underline decoration-warning/40 hover:decoration-warning transition-all ml-2"
                    >
                        Fix Now
                    </button>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="font-display text-4xl font-black mb-3 tracking-tight">Security Command Center</h1>
                    <p className="text-text-muted font-medium max-w-2xl">
                        Manage your encryption protocols, multi-factor authentication, and monitor active device credentials.
                    </p>
                </header>

                {message.text && (
                    <div className={`mb-8 p-6 rounded-3xl border flex items-center gap-4 animate-fade-in-up ${message.type === 'success'
                        ? 'bg-success/10 border-success/20 text-success'
                        : 'bg-danger/10 border-danger/20 text-danger'
                        }`}>
                        <span className="material-symbols-outlined">
                            {message.type === 'success' ? 'verified' : 'report'}
                        </span>
                        <p className="text-sm font-black uppercase tracking-widest">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar / Tabs */}
                    <div className="lg:col-span-3 space-y-2">
                        {[
                            { id: 'auth', label: 'Authentication', icon: 'key' },
                            { id: 'sessions', label: 'Active Sessions', icon: 'devices' },
                            { id: 'history', label: 'Security History', icon: 'history' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                        : 'text-text-muted hover:bg-bg-surface hover:text-text-main border border-transparent hover:border-border-main'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}

                        <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">help</span>
                                Need Assistance?
                            </h4>
                            <p className="text-xs text-text-muted font-medium leading-relaxed mb-4">
                                Suspect unauthorized access? Our security response team is available 24/7.
                            </p>
                            <button className="text-[10px] font-black uppercase tracking-[0.15em] text-primary hover:tracking-[0.2em] transition-all flex items-center gap-2">
                                Contact Support
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        {activeTab === 'auth' && (
                            <>
                                {/* Password Section */}
                                <section className="bg-bg-surface rounded-[2.5rem] border border-border-main p-8 lg:p-10 shadow-xl shadow-black/5 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-2xl font-bold">lock_reset</span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black tracking-tight">Login Credentials</h2>
                                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">
                                                    Last changed: {user.security?.password_changed_at ? new Date(user.security.password_changed_at).toLocaleDateString() : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordChange}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block ml-2">Current Identity Hash</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passwordData.current_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                        placeholder="Enter current password"
                                                        className="w-full px-5 py-4 bg-bg-main border border-border-main rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block ml-2">New Identity Protocol</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passwordData.new_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                        placeholder="8+ characters, symbols"
                                                        className="w-full px-5 py-4 bg-bg-main border border-border-main rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block ml-2">Confirm Protocol</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passwordData.confirm_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                        placeholder="Repeat new password"
                                                        className="w-full px-5 py-4 bg-bg-main border border-border-main rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="p-6 bg-bg-main rounded-3xl border border-border-main flex flex-col justify-center h-full">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-60">Security Requirements</p>
                                                    <ul className="space-y-3">
                                                        {[
                                                            { label: 'Minimum 8 Characters', valid: passwordData.new_password.length >= 8 },
                                                            { label: 'Numeric Sequences', valid: /\d/.test(passwordData.new_password) },
                                                            { label: 'Specialized Symbols', valid: /[!@#$%^&*]/.test(passwordData.new_password) },
                                                            { label: 'Case Diversity', valid: /[A-Z]/.test(passwordData.new_password) && /[a-z]/.test(passwordData.new_password) },
                                                        ].map((req, i) => (
                                                            <li key={i} className="flex items-center gap-3">
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${req.valid ? 'bg-success border-success' : 'border-border-main'}`}>
                                                                    {req.valid && <span className="material-symbols-outlined text-[12px] text-white font-black">check</span>}
                                                                </div>
                                                                <span className={`text-xs font-bold transition-all ${req.valid ? 'text-text-main' : 'text-text-muted'}`}>{req.label}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-end">
                                            <button
                                                disabled={loading}
                                                className="px-10 py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                            >
                                                {loading ? 'Processing...' : 'Update Protocol'}
                                            </button>
                                        </div>
                                    </form>
                                </section>

                                {/* 2FA Section */}
                                <section className="bg-bg-surface rounded-[2.5rem] border border-border-main p-8 lg:p-10 shadow-xl shadow-black/5 animate-fade-in-up-delay-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                                                <span className="material-symbols-outlined text-2xl font-bold">shield</span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black tracking-tight">Two-Factor Authentication</h2>
                                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Add an extra defensive layer</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${user.security?.is_2fa_enabled
                                            ? 'bg-success/10 text-success border-success/20'
                                            : 'bg-danger/10 text-danger border-danger/20'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${user.security?.is_2fa_enabled ? 'bg-success' : 'bg-danger animate-pulse'}`} />
                                            {user.security?.is_2fa_enabled ? 'Active Perimeter' : 'Highly Vulnerable'}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <p className="flex-1 text-sm text-text-muted font-medium leading-relaxed">
                                            Multi-factor authentication protects your academic identity by requiring a second verification step during login. This significantly reduces the risk of account takeovers even if your password is leaked.
                                        </p>
                                        <button
                                            onClick={handleToggle2FA}
                                            disabled={loading}
                                            className={`whitespace-nowrap px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${user.security?.is_2fa_enabled
                                                ? 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white'
                                                : 'bg-primary text-white shadow-xl shadow-primary/20 hover:opacity-90'
                                                }`}
                                        >
                                            {user.security?.is_2fa_enabled ? 'Disable 2FA' : 'Configure 2FA'}
                                        </button>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab === 'sessions' && (
                            <section className="bg-bg-surface rounded-[2.5rem] border border-border-main overflow-hidden shadow-xl shadow-black/5 animate-fade-in-up">
                                <div className="p-8 border-b border-border-main bg-bg-main/30">
                                    <h2 className="text-xl font-black tracking-tight">Active Identity Nodes</h2>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Monitoring all authorized access points</p>
                                </div>
                                <div className="divide-y divide-border-main">
                                    {sessions.length > 0 ? (
                                        sessions.map((session) => (
                                            <div key={session.id} className="p-8 flex items-center justify-between group hover:bg-bg-main/40 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-bg-main rounded-2xl flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border-main">
                                                        <span className="material-symbols-outlined text-3xl">
                                                            {session.os?.toLowerCase().includes('mac') || session.os?.toLowerCase().includes('windows') ? 'laptop_mac' : 'smartphone'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-black text-text-main">{session.os} node</h3>
                                                            {session.is_current && (
                                                                <span className="px-2 py-0.5 bg-success/10 text-success text-[8px] font-black uppercase tracking-widest rounded-full border border-success/20">Current Node</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-muted font-bold tracking-tight">
                                                            {session.browser} • {session.location || 'Unknown Location'} • <span className="opacity-50">{session.ip_address}</span>
                                                        </p>
                                                        <p className="text-[10px] text-text-muted mt-1 opacity-40 uppercase font-black tracking-widest">
                                                            Last Pulse: {new Date(session.last_active).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!session.is_current && (
                                                    <button
                                                        onClick={() => handleRevokeSession(session.id)}
                                                        disabled={loading}
                                                        className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline disabled:opacity-50"
                                                    >
                                                        Terminate
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <p className="text-sm text-text-muted font-medium mb-4">No active identity nodes detected. Please re-authenticate to register this device.</p>
                                            <button
                                                onClick={fetchSessions}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                            >
                                                Refresh Telemetry
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 bg-bg-main/50 border-t border-border-main flex justify-center">
                                    <button
                                        onClick={handlePurgeAllSessions}
                                        disabled={loading || sessions.length <= 1}
                                        className="px-10 py-4 border-2 border-danger text-danger rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all shadow-lg shadow-danger/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Purge All Secondary Sessions
                                    </button>
                                </div>
                            </section>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-bg-surface rounded-[2.5rem] border border-border-main overflow-hidden animate-fade-in-up">
                                <div className="p-8 border-b border-border-main bg-bg-main/30">
                                    <h3 className="font-black text-text-main">Security Audit Trail</h3>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Complete history of security-critical events</p>
                                </div>
                                <div className="divide-y divide-border-main">
                                    {history.length > 0 ? (
                                        history.map((log) => {
                                            const getEventIcon = (type) => {
                                                switch (type) {
                                                    case 'LOGIN': return 'login';
                                                    case 'REGISTER': return 'person_add';
                                                    case 'PWD_CHANGE': return 'lock_reset';
                                                    case '2FA_TOGGLE': return 'security';
                                                    case 'SESSION_REVOKE': return 'link_off';
                                                    case 'UNIVERSAL_PURGE': return 'cleaning_services';
                                                    default: return 'info';
                                                }
                                            };

                                            const getEventLabel = (type) => {
                                                return type.replace(/_/g, ' ');
                                            };

                                            return (
                                                <div key={log.id} className="p-6 flex items-center gap-6 group hover:bg-bg-main/40 transition-all">
                                                    <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border-main">
                                                        <span className="material-symbols-outlined text-2xl">{getEventIcon(log.event_type)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-black text-sm text-text-main uppercase tracking-tight">{getEventLabel(log.event_type)}</h4>
                                                            <span className="text-[10px] text-text-muted font-bold opacity-40">{new Date(log.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-xs text-text-muted font-bold flex items-center gap-2">
                                                            Origin: {log.ip_address}
                                                            {log.metadata && (
                                                                <span className="opacity-40">• {JSON.stringify(log.metadata)}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-16 text-center">
                                            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4 border border-border-main">
                                                <span className="material-symbols-outlined text-text-muted opacity-20">history</span>
                                            </div>
                                            <p className="text-sm text-text-muted font-bold">No security events recorded in the last 30 days.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
