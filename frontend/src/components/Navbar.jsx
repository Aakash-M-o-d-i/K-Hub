import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function fmtDateLong(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Navbar({ onMenuToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = () => {
        if (!user) return;
        api.get('/notifications')
            .then(res => {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unread_count);
            })
            .catch(() => { });
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) { }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            fetchNotifications();
        } catch (err) { }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            navigate(`/dashboard?search=${encodeURIComponent(q)}`);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <header className="h-20 sticky top-0 z-30 bg-bg-surface lg:bg-bg-surface/80 lg:backdrop-blur-xl border-b border-border-main">
            <div className="h-full flex items-center gap-4 px-4 lg:px-8">
                {/* Mobile menu toggle */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-xl hover:bg-bg-main transition-colors text-text-muted hover:text-primary"
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>

                {/* Mobile Logo */}
                <Link to="/" className="lg:hidden flex items-center gap-2 shrink-0">
                    <img src="/logo.png" alt="Knowledge Hub" className="w-8 h-8 object-contain" />
                    <span className="font-display font-black text-sm text-text-main hidden sm:inline">Knowledge Hub</span>
                </Link>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 text-[18px] group-focus-within:text-primary transition-colors">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search papers, subjects..."
                        className="w-full pl-11 pr-10 py-2.5 bg-bg-main/50 hover:bg-bg-main focus:bg-bg-surface rounded-xl border border-border-main text-[13px] text-text-main
              placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(''); navigate('/dashboard'); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-rose-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </form>

                <div className="flex items-center gap-4 ml-auto">
                    {/* Notifications Hub */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-primary hover:bg-primary/5'}`}
                            >
                                <span className="material-symbols-outlined text-[24px]">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-[9px] text-white flex items-center justify-center rounded-full border-2 border-bg-surface font-black animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                    <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-bg-surface border border-border-main rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                                        <div className="bg-bg-main/50 px-6 py-4 border-b border-border-main flex items-center justify-between">
                                            <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest">Academic Signals</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-[0.1em]">Mark all read</button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center">
                                                    <div className="w-12 h-12 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-3 border border-border-main opacity-20">
                                                        <span className="material-symbols-outlined text-2xl">notifications_off</span>
                                                    </div>
                                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-loose">No active notifications.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-border-main/50">
                                                    {notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => {
                                                                if (!n.is_read) markAsRead(n.id);
                                                                if (n.link) navigate(n.link);
                                                                setShowNotifications(false);
                                                            }}
                                                            className={`p-5 hover:bg-bg-main/40 transition-all cursor-pointer group flex gap-4 relative ${!n.is_read ? 'bg-primary/5' : ''}`}
                                                        >
                                                            <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center shadow-inner ${n.type === 'danger' ? 'bg-danger/10 text-danger' :
                                                                n.type === 'warning' ? 'bg-warning/10 text-warning' :
                                                                    n.type === 'success' ? 'bg-success/10 text-success' :
                                                                        'bg-primary/10 text-primary'
                                                                }`}>
                                                                <span className="material-symbols-outlined text-lg">{
                                                                    n.type === 'danger' ? 'error' :
                                                                        n.type === 'warning' ? 'warning' :
                                                                            n.type === 'success' ? 'verified' :
                                                                                'info'
                                                                }</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-[12px] font-black leading-tight ${!n.is_read ? 'text-text-main' : 'text-text-muted'}`}>{n.title}</p>
                                                                <p className="text-[11px] font-medium text-text-muted mt-1 line-clamp-2">{n.message}</p>
                                                                <p className="text-[9px] font-black text-text-muted/40 uppercase tracking-tighter mt-2.5 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                                    {fmtDateLong(n.created_at)}
                                                                </p>
                                                            </div>
                                                            {!n.is_read && <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-primary rounded-full" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Upload button */}
                    {user && (
                        <Link
                            to="/upload/new"
                            className="flex items-center gap-2 p-2 md:px-5 md:py-2.5 bg-primary text-white text-[13px] font-black rounded-xl
                     hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg shadow-primary/20 group"
                        >
                            <span className="material-symbols-outlined text-[24px] md:text-[20px] text-white/90 group-hover:text-white transition-colors">cloud_upload</span>
                            <span className="hidden md:inline">Upload</span>
                        </Link>
                    )}

                    {/* User Profile */}
                    {user && (
                        <div className="flex items-center gap-3 pl-4 border-l border-border-main">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 border-2 border-bg-surface ring-1 ring-border-main cursor-pointer hover:scale-105 transition-transform">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
