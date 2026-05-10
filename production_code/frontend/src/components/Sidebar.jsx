import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/dashboard', icon: 'home', label: 'Dashboard' },
    { to: '/downloads', icon: 'download', label: 'My Downloads' },
    { to: '/uploads', icon: 'upload_file', label: 'My Uploads' },
    { to: '/bookmarks', icon: 'bookmark', label: 'Saved Papers' },
    { to: '/leaderboard', icon: 'leaderboard', label: 'Leaderboard' },
];

const bottomItems = [
    { to: '/profile', icon: 'person', label: 'My Profile' },
    { to: '/preferences', icon: 'settings', label: 'Preferences' },
    { to: '/security', icon: 'verified_user', label: 'Security' },
    { to: '/tutorial', icon: 'quiz', label: 'Tutorial' },
    { to: '/about', icon: 'info', label: 'About' },
];

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };


    const isItemActive = (to) => {
        return location.pathname === to;
    };

    return (
        <>
            {/* Overlay on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-bg-main/60 backdrop-blur-sm z-[90] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-bg-surface text-text-main flex flex-col z-[100] transition-transform duration-300 ease-in-out border-r border-border-main
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Header / Logo */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-border-main bg-bg-main/30">
                    <Link to="/" onClick={onClose} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                        <img src="/logo.png" alt="Knowledge Hub Logo" className="w-9 h-9 object-contain" />
                        <div>
                            <h1 className="font-display font-black text-base leading-tight tracking-tight text-text-main">Knowledge Hub</h1>
                            <p className="text-[9px] text-text-muted uppercase tracking-widest font-black opacity-60">
                                {user ? 'User Portal' : 'Public Portal'}
                            </p>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-bg-main rounded-xl transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems
                        .filter(item => {
                            if (!user) {

                                return ['Dashboard', 'Leaderboard'].includes(item.label);
                            }
                            return true;
                        })
                        .map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={() =>
                                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-300 group
                ${isItemActive(item.to)
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                        : 'text-text-muted hover:bg-text-muted/5 hover:text-text-main'
                                    }`
                                }
                            >
                                <span className={`material-symbols-outlined text-[22px] transition-colors duration-300 ${isItemActive(item.to) ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </NavLink>
                        ))}

                    {isAdmin && (
                        <div className="pt-4 space-y-1.5 border-t border-border-main/50 mt-4">
                            <p className="px-5 text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-3">Management</p>
                            <NavLink
                                to="/nituganesh"
                                onClick={onClose}
                                className={() =>
                                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-black transition-all duration-300 group
                  ${location.pathname.startsWith('/nituganesh')
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.1)]'
                                        : 'text-text-muted hover:bg-primary/5 hover:text-primary'
                                    }`
                                }
                            >
                                <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${location.pathname.startsWith('/nituganesh') ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`}>
                                    {user?.role?.toLowerCase() === 'super_admin' ? 'admin_panel_settings' : 'shield_person'}
                                </span>
                                {user?.role?.toLowerCase() === 'super_admin' ? 'Control Center' : 'Admin Panel'}
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            </NavLink>
                        </div>
                    )}

                    {user && (
                        <div className="mt-8 mb-4 px-4 text-center">
                            <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.2em]">Account Ecosystem</p>
                        </div>
                    )}
                </nav>

                {/* Bottom Section */}
                <div className="p-3 space-y-1 border-t border-border-main">
                    {bottomItems
                        .filter(item => user || item.label === 'Tutorial')
                        .map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={() =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 font-black
                ${isItemActive(item.to) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`
                                }
                            >
                                <span className={`material-symbols-outlined text-xl ${isItemActive(item.to) ? 'text-white' : ''}`}>{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}

                    {!user && (
                        <Link
                            to="/login"
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-primary hover:bg-primary/5 transition-all duration-300"
                        >
                            <span className="material-symbols-outlined text-xl">login</span>
                            Sign In
                        </Link>
                    )}

                    {/* User card */}
                    {user && (
                        <div className="mt-3 p-3 bg-bg-main rounded-xl flex items-center gap-3 border border-border-main">
                            <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text-main truncate leading-none mb-1">{user.name}</p>
                                <p className="text-[10px] text-text-muted truncate uppercase tracking-tight">{user.role || 'Member'}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
