import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

/* ────────────────────────── helpers ────────────────────────── */

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateLong(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function RoleBadge({ role }) {
    const map = {
        super_admin: { cls: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Super Admin' },
        admin: { cls: 'bg-primary/10 text-primary border-primary/20', label: 'Moderator' },
        student: { cls: 'bg-bg-main text-text-muted border-border-main', label: 'Student' },
    };
    const m = map[role] || map.student;
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest transition-colors ${m.cls}`}>
            {m.label}
        </span>
    );
}

/* ────────────────────── User Detail Slide-over ────────────────────── */

function UserSlideOver({ userId, onClose, onBan, onDelete }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminToggle, setAdminToggle] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        api.get(`/nituganesh/users/${userId}`)
            .then(res => {
                setUser(res.data);
                setAdminToggle(res.data.role === 'admin' || res.data.role === 'super_admin');
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleToggleAdmin = async () => {
        const newRole = adminToggle ? 'student' : 'admin';
        try {
            const res = await api.put(`/nituganesh/users/${userId}/role`, { role: newRole });
            setUser(res.data.user);
            setAdminToggle(newRole !== 'student');
        } catch {
        
        }
    };

    const handleBan = async () => {
        if (!onBan) return;
        const updatedUser = await onBan(userId);
        if (updatedUser) setUser(updatedUser);
    };

    if (!userId) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity animate-in fade-in duration-300" onClick={onClose} />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
                <div ref={panelRef} className="w-screen max-w-md transform transition duration-500 ease-in-out sm:duration-700 translate-x-0 animate-in slide-in-from-right">
                    <div className="flex h-full flex-col bg-bg-surface border-l border-border-main shadow-2xl">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] animate-pulse">Syncing Profile...</p>
                            </div>
                        ) : !user ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Entity not located</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="px-8 py-10 bg-bg-main/50 border-b border-border-main relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                {user.avatar_url ? (
                                                    <>
                                                        <img src={user.avatar_url} alt={user.name} className="h-20 w-20 rounded-[2rem] object-cover border-4 border-bg-surface shadow-2xl" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                        <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark items-center justify-center text-white text-2xl font-black border-4 border-bg-surface shadow-2xl" style={{ display: 'none' }}>
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-black border-4 border-bg-surface shadow-2xl">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className={`absolute -bottom-1 -right-1 block h-5 w-5 rounded-full ring-4 ring-bg-surface shadow-lg ${user.is_banned ? 'bg-danger' : 'bg-success'}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-black text-text-main tracking-tight">{user.name}</h2>
                                                <p className="text-[11px] font-bold text-text-muted opacity-70 tracking-tight">{user.email}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <RoleBadge role={user.role} />
                                                    {user.is_banned && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest bg-danger/10 text-danger border-danger/20">
                                                            Banned
                                                        </span>
                                                    )}
                                                    {user.department && (
                                                        <span className="bg-bg-surface text-text-muted text-[9px] px-2.5 py-0.5 rounded-lg border border-border-main font-black uppercase tracking-widest">
                                                            {user.department.code}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-bg-surface text-text-muted hover:text-danger hover:bg-danger/10 border border-border-main transition-all shadow-sm">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-main px-8 py-8 space-y-10">
                                    {/* Admin Privileges Toggle */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between p-6 bg-bg-main/40 rounded-[2rem] border border-border-main">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-bg-surface text-primary border border-border-main shadow-sm">
                                                    <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-text-main tracking-tight">Administrative Status</p>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Control paper moderation</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleToggleAdmin}
                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ring-offset-bg-surface ${adminToggle ? 'bg-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'bg-border-main'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${adminToggle ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                        {/* Ban User Button */}
                                        <button
                                            onClick={handleBan}
                                            className={`w-full h-14 inline-flex justify-center items-center rounded-[1.5rem] border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm transition-all group ${user.is_banned
                                                    ? 'border-success/20 bg-success/5 text-success hover:bg-success hover:text-white'
                                                    : 'border-warning/20 bg-warning/5 text-warning hover:bg-warning hover:text-white'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-sm mr-2 group-hover:scale-110 transition-transform">
                                                {user.is_banned ? 'lock_open' : 'block'}
                                            </span>
                                            {user.is_banned ? 'Restore Access' : 'Suspend Access'}
                                        </button>
                                        {/* Delete User Button */}
                                        <button
                                            onClick={() => onDelete && onDelete(userId, user.name)}
                                            className="w-full h-14 inline-flex justify-center items-center rounded-[1.5rem] border border-danger/20 bg-danger/5 px-4 py-2.5 text-[11px] font-black text-danger uppercase tracking-[0.2em] shadow-sm hover:bg-danger hover:text-white transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-sm mr-2 group-hover:scale-110 transition-transform">delete_forever</span>
                                            Delete User Permanently
                                        </button>
                                    </section>

                                    {/* Performance Metrics */}
                                    <section>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 pl-1">Performance Protocol</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-bg-main/30 p-5 rounded-[2rem] border border-border-main text-center shadow-sm group hover:border-warning/50 transition-colors">
                                                <div className="flex items-center justify-center text-warning mb-2">
                                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    <span className="ml-1.5 text-lg font-black text-text-main tracking-tighter">{user.avg_rating || '—'}</span>
                                                </div>
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Ranking</p>
                                            </div>
                                            <div className="bg-bg-main/30 p-5 rounded-[2rem] border border-border-main text-center shadow-sm group hover:border-primary/50 transition-colors relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <div className="flex items-center justify-center text-primary mb-2">
                                                        <span className="material-symbols-outlined text-xl">upload_file</span>
                                                        <span className="ml-1.5 text-lg font-black text-text-main tracking-tighter">{user.upload_count}</span>
                                                    </div>
                                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Uploads</p>
                                                </div>
                                            </div>
                                            <div className="bg-bg-main/30 p-5 rounded-[2rem] border border-border-main text-center shadow-sm group hover:border-success/50 transition-colors">
                                                <div className="flex items-center justify-center text-success mb-2">
                                                    <span className="material-symbols-outlined text-xl">download</span>
                                                    <span className="ml-1.5 text-lg font-black text-text-main tracking-tighter">{user.total_downloads}</span>
                                                </div>
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Pulls</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Academic Details */}
                                    <section>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 pl-1">Academic Profile</p>
                                        <div className="bg-bg-main/30 rounded-[2rem] p-6 space-y-4 border border-border-main">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Faculty Division</span>
                                                <span className="text-[12px] font-black text-text-main tracking-tight">{user.department?.name || 'Unassigned'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Record Inception</span>
                                                <span className="text-[12px] font-black text-text-main tracking-tight">{fmtDateLong(user.created_at)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Entity Signature</span>
                                                <span className="text-[10px] font-black text-text-main font-mono bg-bg-surface px-4 py-1 rounded-xl border border-border-main shadow-sm tracking-tighter">NODE-USR-{user.id}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Contribution Meta</span>
                                                <span className="text-[12px] font-black text-primary tracking-tight">{user.total_points} Units</span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Activity Timeline */}
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Operational Logs</p>
                                            <button className="text-[10px] font-black text-primary px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors uppercase tracking-widest">Master View</button>
                                        </div>
                                        <div className="flow-root relative pl-1">
                                            <div className="absolute left-5 top-2 bottom-6 w-px bg-border-main" />
                                            <ul role="list" className="space-y-10">
                                                {/* Upload activity */}
                                                <li className="relative flex items-center gap-6 group">
                                                    <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm relative z-10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                        <span className="material-symbols-outlined text-lg">upload</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-text-main tracking-tight">Academic Material Broadcast</p>
                                                        <p className="text-[10px] font-bold text-text-muted mt-0.5 opacity-60 uppercase tracking-widest">{user.upload_count} Vectors Shared</p>
                                                    </div>
                                                </li>
                                                {/* Downloads milestone */}
                                                <li className="relative flex items-center gap-6 group">
                                                    <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-success/10 text-success border border-success/20 shadow-sm relative z-10 group-hover:bg-success group-hover:text-white transition-all duration-300">
                                                        <span className="material-symbols-outlined text-lg">trending_up</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-text-main tracking-tight">Knowledge Pulse Distribution</p>
                                                        <p className="text-[10px] font-bold text-text-muted mt-0.5 opacity-60 uppercase tracking-widest">{user.total_downloads} Successful Pulls</p>
                                                    </div>
                                                </li>
                                                {/* Points earned */}
                                                <li className="relative flex items-center gap-6 group">
                                                    <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-warning/10 text-warning border border-warning/20 shadow-sm relative z-10 group-hover:bg-warning group-hover:text-white transition-all duration-300">
                                                        <span className="material-symbols-outlined text-lg">emoji_events</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-text-main tracking-tight">Merit Achievement Earned</p>
                                                        <p className="text-[10px] font-bold text-text-muted mt-0.5 opacity-60 uppercase tracking-widest">{user.total_points} Metric Units Accrued</p>
                                                    </div>
                                                </li>
                                                {/* Account created */}
                                                <li className="relative flex items-center gap-6 group">
                                                    <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-bg-main text-text-muted border border-border-main shadow-sm relative z-10 group-hover:text-text-main transition-all">
                                                        <span className="material-symbols-outlined text-lg">person_add</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-text-main tracking-tight">Entity Initialization</p>
                                                        <p className="text-[10px] font-bold text-text-muted mt-0.5 opacity-60 uppercase tracking-widest">{fmtDateLong(user.created_at)}</p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </section>
                                </div>

                                {/* Footer */}
                                <div className="flex-shrink-0 border-t border-border-main px-8 py-6 bg-bg-main/50">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Entity Active Since {fmtDate(user.created_at)}</p>
                                        <button className="flex items-center gap-2 text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-widest">
                                            Comprehensive History
                                            <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ────────────────────── User Management Component ────────────────────── */

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const perPage = 10;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/nituganesh/users', { params: { page, per_page: perPage, search } });
            setUsers(res.data.users);
            setTotalPages(res.data.pages);
            setTotalCount(res.data.total);
        } catch {
        
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/nituganesh/users/stats');
            setUserStats(res.data);
        } catch {
        
        }
    };

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchUsers(); }, [page, search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/nituganesh/users/export', {
                params: { search },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
        
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${userName}"? This will remove their profile and data. Approved papers contributed by this user will be preserved. This action is IRREVERSIBLE.`)) return;
        try {
            await api.delete(`/nituganesh/users/${userId}`);
            setSelectedUserId(null);
            fetchUsers();
            fetchStats();
        } catch {
        
        }
    };

    const handleBanUser = async (userId) => {
        try {
            const res = await api.put(`/nituganesh/users/${userId}/ban`);
            fetchUsers();
            return res.data.user;
        } catch {
        
            return null;
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* ─── Stat Cards ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-bg-surface p-7 rounded-[2.5rem] border border-border-main shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-2xl">group</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Registry</p>
                            <h3 className="text-3xl font-black text-text-main tracking-tight">{userStats?.total_users?.toLocaleString() ?? 'ERR_BUF'}</h3>
                        </div>
                    </div>

                    <div className="bg-bg-surface p-7 rounded-[2.5rem] border border-border-main shadow-sm hover:shadow-xl hover:shadow-warning/5 transition-all group overflow-hidden relative">
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-warning/10 rounded-2xl text-warning group-hover:bg-warning group-hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-2xl">pending_actions</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Authorization Backlog</p>
                            <h3 className="text-3xl font-black text-text-main tracking-tight">{userStats?.pending_approvals ?? '0'}</h3>
                        </div>
                    </div>

                    <div className="bg-bg-surface p-7 rounded-[2.5rem] border border-border-main shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-2xl">security</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Security Nodes</p>
                            <h3 className="text-3xl font-black text-text-main tracking-tight">{userStats?.active_moderators ?? '0'}</h3>
                        </div>
                    </div>
                </div>

                {/* ─── Toolbar ─── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative w-full md:w-[28rem] group">
                        <span className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </span>
                        <input
                            className="w-full pl-14 pr-6 py-4 bg-bg-surface border border-border-main rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-[0.2em] text-[13px] font-black text-text-main shadow-sm"
                            placeholder="Identify Entity By Name, Email, Or Role..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExport}
                            className="flex items-center px-6 py-4 bg-bg-surface border border-border-main text-text-muted rounded-2xl hover:bg-bg-main hover:text-text-main transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg mr-2">download</span>
                            Export Protocol
                        </button>
                        <button className="flex items-center px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl transition-all shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest group">
                            <span className="material-symbols-outlined text-lg mr-2 group-hover:scale-110 transition-transform">person_add</span>
                            Initialize User
                        </button>
                    </div>
                </div>

                {/* ─── Data Table ─── */}
                <div className="bg-bg-surface rounded-[2.5rem] border border-border-main shadow-xl overflow-hidden relative transition-colors">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-600 mb-3 block">person_off</span>
                            <p className="text-slate-500 text-sm">No users found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-bg-main/50 border-b border-border-main">
                                        <th className="py-5 px-8 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">
                                            <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                                <span>Subject Identity</span>
                                                <span className="material-symbols-outlined text-sm">unfold_more</span>
                                            </div>
                                        </th>
                                        <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Access Protocol</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Division</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Activation Date</th>
                                        <th className="py-5 px-10 text-[10px] font-black text-text-muted uppercase tracking-widest text-right whitespace-nowrap">Direct Protocol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-main/50">
                                    {users.map(u => (
                                        <tr key={u.id} className={`group hover:bg-bg-main/40 transition-all duration-300 cursor-pointer ${u.is_banned ? 'opacity-60' : ''}`} onClick={() => setSelectedUserId(u.id)}>
                                            <td className="py-5 px-8 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        {u.avatar_url ? (
                                                            <>
                                                                <img
                                                                    src={u.avatar_url}
                                                                    alt={u.name}
                                                                    className="h-10 w-10 rounded-xl object-cover border-2 border-border-main group-hover:border-primary transition-colors shadow-sm"
                                                                    referrerPolicy="no-referrer"
                                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                                />
                                                                <div className="h-10 w-10 rounded-xl bg-primary/10 items-center justify-center text-primary font-black text-sm border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-sm" style={{ display: 'none' }}>
                                                                    {u.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                                {u.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        {u.is_banned && <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border-2 border-bg-surface" />}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-[13px] font-black text-text-main group-hover:text-primary transition-colors tracking-tight">{u.name}</div>
                                                        <div className="text-[10px] font-bold text-text-muted opacity-60 uppercase tracking-tighter">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <RoleBadge role={u.role} />
                                                    {u.is_banned && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-danger/10 text-danger border border-danger/20 uppercase tracking-widest">Banned</span>}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 whitespace-nowrap">
                                                <span className="text-[11px] font-black text-text-main/80 uppercase tracking-tight">{u.department?.name || 'Unassigned'}</span>
                                            </td>
                                            <td className="py-5 px-6 whitespace-nowrap text-[10px] font-black text-text-muted font-mono tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                                                {fmtDate(u.created_at)}
                                            </td>
                                            <td className="py-5 px-10 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedUserId(u.id); }}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-main text-text-muted hover:text-primary hover:bg-primary/5 border border-border-main transition-all shadow-sm"
                                                        title="View Profile"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleBanUser(u.id); }}
                                                        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-sm ${u.is_banned ? 'bg-success/10 text-success hover:bg-success hover:text-white border-success/20' : 'bg-warning/5 text-warning/60 hover:bg-warning hover:text-white border-transparent hover:border-warning/20'}`}
                                                        title={u.is_banned ? 'Unban User' : 'Ban User'}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">{u.is_banned ? 'lock_open' : 'block'}</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id, u.name); }}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-danger/5 text-danger/40 hover:text-white hover:bg-danger border border-transparent hover:border-danger/20 transition-all shadow-sm"
                                                        title="Delete User"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Footer */}
                    {users.length > 0 && (
                        <div className="bg-bg-main/30 px-8 py-5 border-t border-border-main flex items-center justify-between">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">
                                Output Stream <span className="text-text-main">{(page - 1) * perPage + 1}-{Math.min(page * perPage, totalCount)}</span> Of <span className="text-text-main">{totalCount.toLocaleString()}</span> Registry Entries
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="h-10 px-5 flex items-center justify-center rounded-2xl bg-bg-surface border border-border-main text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-primary hover:bg-bg-main disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Previous Shift
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${page === p ? 'bg-primary text-white shadow-lg shadow-primary/20 border border-primary' : 'bg-bg-surface text-text-muted border border-border-main hover:border-primary hover:text-primary shadow-sm'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                {totalPages > 3 && <span className="text-text-muted/40 font-black tracking-widest px-2">...</span>}
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="h-10 px-5 flex items-center justify-center rounded-2xl bg-bg-surface border border-border-main text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-primary hover:bg-bg-main disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Next Shift
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Details Slide-over */}
            {selectedUserId && (
                <UserSlideOver userId={selectedUserId} onClose={() => setSelectedUserId(null)} onBan={handleBanUser} onDelete={handleDeleteUser} />
            )}
        </>
    );
}
