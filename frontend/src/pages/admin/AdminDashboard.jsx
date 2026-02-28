import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import UserManagement from './UserManagement';
import AuditLogs from './AuditLogs';
import AdminSettings from './AdminSettings';
import Preferences from '../Preferences';


/* ────────────────────────── helpers ────────────────────────── */

const DEPT_COLORS = {
    CS: { bg: 'bg-blue-900/30', text: 'text-blue-300' },
    Mech: { bg: 'bg-orange-900/30', text: 'text-orange-300' },
    Chem: { bg: 'bg-purple-900/30', text: 'text-purple-300' },
    Mgmt: { bg: 'bg-pink-900/30', text: 'text-pink-300' },
    default: { bg: 'bg-slate-700', text: 'text-slate-300' },
};
function getDeptColor(code) { return DEPT_COLORS[code] || DEPT_COLORS.default; }

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' });
}
function fmtDateLong(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function StatusBadge({ status }) {
    const s = status?.toLowerCase() || 'pending';
    const map = {
        pending: { cls: 'bg-yellow-900/30 text-yellow-300', dot: 'bg-yellow-500' },
        approved: { cls: 'bg-green-900/30 text-green-300', dot: 'bg-green-500' },
        rejected: { cls: 'bg-red-900/30 text-red-300', dot: 'bg-red-500' },
    };
    const m = map[s] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
            {status || 'Pending'}
        </span>
    );
}

const adminNavMain = [
    { to: '/sector-delta', icon: 'dashboard', label: 'Dashboard', end: true },
    { to: '/sector-delta/moderation', icon: 'gavel', label: 'Moderation Queue', badge: true },
    { to: '/sector-delta/users', icon: 'people', label: 'User Management' },
];
const adminNavSystem = [
    { to: '/sector-delta/audit', icon: 'history', label: 'Audit Logs' },
    { to: '/sector-delta/settings', icon: 'settings', label: 'Settings' },
    { to: '/sector-delta/preferences', icon: 'settings_suggest', label: 'Preferences' },
];

/* ────────────────────── Review Page (Screen #05) ────────────────────── */

function ReviewPage({ paper: initialPaper, pendingCount, onAction, onBack, user: adminUser }) {
    const [paper, setPaper] = useState(initialPaper);
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectNote, setRejectNote] = useState('');
    const [notes, setNotes] = useState('');
    const [editData, setEditData] = useState({
        title: initialPaper.title || '',
        subject_code: initialPaper.subject_code || '',
        semester: initialPaper.semester || '',
        year: initialPaper.year || '',
        department_id: initialPaper.department_id || '',
        exam_type: initialPaper.exam_type || 'End-Sem Registry'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [departments, setDepartments] = useState([]);

    const isSuperAdmin = adminUser?.role === 'super_admin';
    const isPdf = paper.file_type === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png'].includes(paper.file_type);
    const previewUrl = `${api.defaults.baseURL}/papers/${paper.id}/preview`;

    useEffect(() => {
        if (isSuperAdmin) {
            api.get('/papers/departments').then(res => setDepartments(res.data.departments)).catch(() => { });
        }
    }, [isSuperAdmin]);

    const handleSaveMetadata = async () => {
        if (!editData.title || !editData.subject_code) {
            alert('Subject Title and Code are required protocol fields.');
            return;
        }
        if (!/^\d{4}-\d{4}$/.test(editData.year)) {
            alert('Academic Session must follow the YYYY-YYYY format protocol.');
            return;
        }
        setIsSaving(true);
        try {
            const res = await api.put(`/v1/internal/papers/${paper.id}/metadata`, editData);
            setPaper(res.data.paper);
            alert('Metadata protocol updated successfully.');
        } catch (err) {
            console.error(err);
            alert('Failed to sync metadata changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReject = () => {
        const fullReason = [rejectReason, rejectNote].filter(Boolean).join(': ') || 'Rejected by admin';
        onAction(paper.id, 'reject', fullReason);
    };

    const handleInputChange = (key, val) => {
        let correctedVal = val;
        // Smart Correction Logic
        if (key === 'subject_code') correctedVal = val.toUpperCase().replace(/\s/g, '');
        if (key === 'title') correctedVal = val.replace(/\s\s+/g, ' '); // Remove double spaces

        setEditData(prev => ({ ...prev, [key]: correctedVal }));
    };

    return (
        <div className="flex flex-col h-screen bg-bg-main selection:bg-primary/20">
            {/* ─── Top Navigation Bar ─── */}
            <header className="h-16 bg-bg-surface/80 backdrop-blur-md border-b border-border-main flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <nav className="flex items-center text-[10px] font-black uppercase tracking-widest text-text-muted/60">
                        <span onClick={onBack} className="hover:text-primary cursor-pointer transition-colors">Admin</span>
                        <span className="material-symbols-outlined text-xs mx-3 opacity-30">chevron_right</span>
                        <span onClick={onBack} className="hover:text-primary cursor-pointer transition-colors">Queue</span>
                        <span className="material-symbols-outlined text-xs mx-3 opacity-30">chevron_right</span>
                        <span className="text-text-main font-black">Review Protocol</span>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-warning/10 rounded-full border border-warning/20">
                        <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                        <span className="text-[10px] font-black text-warning uppercase tracking-widest">{pendingCount} Waiting for Action</span>
                    </div>
                    <div className="flex items-center gap-4 pl-4 border-l border-border-main">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-text-main tracking-tight">{adminUser?.name || 'Controller'}</p>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter opacity-70">Privileged Tier</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                            {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── Main Split View ─── */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Panel: Metadata & Actions */}
                <aside className="w-full lg:w-[450px] bg-bg-surface border-r border-border-main flex flex-col overflow-y-auto shrink-0 z-10 shadow-xl lg:h-full max-h-[60vh] lg:max-h-none">
                    {/* Uploader Info Card */}
                    <div className="p-8 border-b border-border-main bg-bg-main/30">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Subject Entity Profile</h3>
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/20">
                                {paper.uploader?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                                <p className="text-base font-black text-text-main leading-tight">{paper.uploader?.name || 'Anonymous Entity'}</p>
                                <p className="text-xs font-bold text-text-muted mt-0.5">Reference ID: {paper.uploader?.id || '—'}</p>
                                <p className="text-[10px] text-primary mt-2 flex items-center gap-1.5 font-black uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm">event_available</span>
                                    Registry: {fmtDateLong(paper.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Form */}
                    <div className="p-8 flex-1 space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">database</span>
                                Content Meta-Data {isSuperAdmin && <span className="text-primary ml-1">(Editable)</span>}
                            </h3>
                            <div className="space-y-6">
                                {/* Subject Name */}
                                <div>
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Subject Title</label>
                                    <div className="relative">
                                        <input
                                            className={`w-full bg-bg-main/50 border border-border-main rounded-xl px-5 py-3.5 text-sm text-text-main font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${isSuperAdmin ? 'hover:border-primary/40' : 'cursor-default'}`}
                                            readOnly={!isSuperAdmin}
                                            type="text"
                                            value={isSuperAdmin ? editData.title : (paper.title || '—')}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                        />
                                        {!isSuperAdmin && <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-muted opacity-30 text-lg">lock</span>}
                                    </div>
                                </div>
                                {/* Subject Code + Exam Type */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Catalogue Code</label>
                                        <input
                                            className={`w-full bg-bg-main/50 border border-border-main rounded-xl px-5 py-3.5 text-sm text-text-main font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${isSuperAdmin ? 'hover:border-primary/40' : 'cursor-default'}`}
                                            readOnly={!isSuperAdmin}
                                            value={isSuperAdmin ? editData.subject_code : (paper.subject_code || '—')}
                                            onChange={(e) => handleInputChange('subject_code', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Examination Hub</label>
                                        <select
                                            disabled={!isSuperAdmin}
                                            className={`w-full bg-bg-main/50 border border-border-main rounded-xl px-4 py-3 text-sm text-text-main font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none ${isSuperAdmin ? 'hover:border-primary/40 cursor-pointer' : 'cursor-default'}`}
                                            value={isSuperAdmin ? editData.exam_type : (paper.exam_type || 'End Semester')}
                                            onChange={(e) => handleInputChange('exam_type', e.target.value)}
                                        >
                                            <option value="End Semester">End Semester</option>
                                            <option value="Mid 1">Mid Semester 1</option>
                                            <option value="Mid 2">Mid Semester 2</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Year + Semester */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Academic Session</label>
                                        <select
                                            disabled={!isSuperAdmin}
                                            className={`w-full bg-bg-main/50 border border-border-main rounded-xl px-4 py-3 text-sm text-text-main font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none ${isSuperAdmin ? 'hover:border-primary/40 cursor-pointer' : 'cursor-default'}`}
                                            value={isSuperAdmin ? editData.year : (paper.year || '—')}
                                            onChange={(e) => handleInputChange('year', e.target.value)}
                                        >
                                            {['2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021'].map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Current Semester</label>
                                        <select
                                            disabled={!isSuperAdmin}
                                            className={`w-full bg-bg-main/50 border border-border-main rounded-xl px-4 py-3 text-sm text-text-main font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none ${isSuperAdmin ? 'hover:border-primary/40 cursor-pointer' : 'cursor-default'}`}
                                            value={isSuperAdmin ? editData.semester : (paper.semester || '—')}
                                            onChange={(e) => handleInputChange('semester', e.target.value)}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                <option key={s} value={s}>Semester {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Branch / Department */}
                                <div>
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Department / Branch</label>
                                    <select
                                        disabled={!isSuperAdmin}
                                        className={`w-full bg-bg-main/50 border border-border-main rounded-xl px-4 py-3 text-sm text-text-main font-black focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none ${isSuperAdmin ? 'hover:border-primary/40 cursor-pointer' : 'cursor-default'}`}
                                        value={isSuperAdmin ? editData.department_id : (paper.department_id || '')}
                                        onChange={(e) => handleInputChange('department_id', e.target.value)}
                                    >
                                        <option value="">Select Branch</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                                        ))}
                                        {!isSuperAdmin && paper.department && (
                                            <option value={paper.department_id}>{paper.department.name}</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            {isSuperAdmin && (
                                <button
                                    onClick={handleSaveMetadata}
                                    disabled={isSaving}
                                    className="w-full py-3.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    {isSaving ? 'Syncing Protocol...' : 'Save Protocol Changes'}
                                </button>
                            )}
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-3">Detected Keywords</label>
                            <div className="flex flex-wrap gap-2">
                                {(paper.subject_code ? [paper.subject_code] : []).concat(
                                    paper.department?.code ? [paper.department.code] : [],
                                    paper.semester ? [`Sem ${paper.semester}`] : []
                                ).map((tag) => (
                                    <span key={tag} className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Internal Notes */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Internal Notes (Optional)</label>
                            <textarea
                                className="w-full bg-[#0f1621] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500"
                                placeholder="Add notes for other admins..."
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ─── Sticky Footer: Actions ─── */}
                    <div className="sticky bottom-0 p-8 bg-bg-surface border-t border-border-main z-20 shadow-[0_-12px_24px_rgba(0,0,0,0.02)]">
                        {!rejectMode ? (
                            <div className="grid grid-cols-2 gap-5">
                                <button
                                    onClick={() => setRejectMode(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-danger/30 bg-danger/5 hover:bg-danger hover:text-white text-danger font-black text-xs uppercase tracking-widest transition-all duration-300 group"
                                >
                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">close</span>
                                    Flag for Rejection
                                </button>
                                <button
                                    onClick={() => onAction(paper.id, 'approve')}
                                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    <span className="material-symbols-outlined text-lg">verified</span>
                                    Authorize Access
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-black text-danger uppercase tracking-widest ml-1">Rejection Reason Protocol</label>
                                    <button onClick={() => setRejectMode(false)} className="text-[10px] font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors">Abort</button>
                                </div>
                                <select
                                    className="w-full bg-bg-main/50 border border-border-main rounded-xl px-4 py-3 text-sm text-text-main font-bold focus:outline-none focus:ring-4 focus:ring-danger/10 focus:border-danger/40 transition-all appearance-none cursor-pointer"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                >
                                    <option value="">Select failure manifest...</option>
                                    <option>Legibility Failure (Blurry)</option>
                                    <option>Metadata Inconsistency</option>
                                    <option>Duplicate Registry Entry</option>
                                    <option>Academic Irrelevance</option>
                                    <option>Other / Custom</option>
                                </select>
                                <textarea
                                    className="w-full bg-bg-main/50 border border-border-main rounded-xl px-4 py-3 text-sm text-text-main font-bold placeholder:font-medium placeholder:text-text-muted/40 focus:outline-none focus:ring-4 focus:ring-danger/10 focus:border-danger/40 transition-all"
                                    placeholder="Provide detailed feedback for uploader..."
                                    rows="2"
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                />
                                <button
                                    onClick={handleReject}
                                    className="w-full py-4 bg-danger hover:bg-danger-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-danger/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    Finalise Rejection
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Panel: PDF Preview */}
                <section className="flex-1 bg-bg-main relative flex flex-col h-full min-h-[500px] lg:min-h-0 overflow-hidden">
                    {/* Viewer Toolbar */}
                    <div className="h-14 bg-bg-surface/90 backdrop-blur-md border-b border-border-main flex items-center justify-between px-8 shadow-sm z-10 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-danger text-2xl animate-pulse">picture_as_pdf</span>
                            <span className="text-sm font-black text-text-main truncate max-w-[200px] md:max-w-md tracking-tight">
                                {paper.file_path?.split('/').pop() || 'Untitled_Document_Buffer'}
                            </span>
                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-bg-main border border-border-main text-text-muted uppercase tracking-widest">
                                {paper.file_size ? `${(paper.file_size / 1024 / 1024).toFixed(1)} MB` : 'DYN_SIZE'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                title="Open Native Viewer"
                            >
                                <span className="material-symbols-outlined text-xl">open_in_new</span>
                            </a>
                        </div>
                    </div>

                    {/* PDF / Image Container */}
                    <div className="flex-1 overflow-y-auto flex justify-center bg-bg-main/50 relative" style={{ backgroundImage: 'radial-gradient(var(--border-main) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/20 to-transparent pointer-events-none" />
                        {isPdf ? (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-none relative z-10"
                                title="Academic Content Buffer"
                            />
                        ) : isImage ? (
                            <div className="p-12 flex justify-center relative z-10">
                                <img
                                    src={previewUrl}
                                    alt="Academic Payload Preview"
                                    className="max-w-[850px] w-full shadow-[0_32px_64px_rgba(0,0,0,0.2)] rounded-lg border-4 border-bg-surface transition-transform hover:scale-[1.01] duration-700"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center relative z-10 px-8">
                                <div className="w-24 h-24 rounded-full bg-bg-surface flex items-center justify-center mb-6 shadow-xl border border-border-main">
                                    <span className="material-symbols-outlined text-5xl text-text-muted/20">description_off</span>
                                </div>
                                <h4 className="text-xl font-black text-text-main mb-2">Interface Impediment</h4>
                                <p className="text-text-muted text-sm font-medium max-w-xs">Direct preview protocols are unavailable for .{paper.file_type} files.</p>
                                <p className="text-[10px] font-black text-primary mt-6 uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10">Use External Navigation Hook</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}


/* ──────────────────── Main Admin Dashboard (Screen #04) ──────────────────── */

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [reviewPaper, setReviewPaper] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isUsersPage = location.pathname === '/sector-delta/users';
    const isAuditPage = location.pathname === '/sector-delta/audit';
    const isSettingsPage = location.pathname === '/sector-delta/settings';
    const isPreferencesPage = location.pathname === '/sector-delta/preferences';

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const pageTitle = isUsersPage ? 'User Management' :
        isAuditPage ? 'Audit Logs' :
            isSettingsPage ? 'System Settings' :
                isPreferencesPage ? 'Workspace Preferences' :
                    'Control Center';

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/v1/internal/stats'),
            api.get('/v1/internal/papers/pending', {
                params: {
                    page,
                    per_page: 20,
                    status: filter === 'all' ? undefined : filter,
                    search: debouncedSearch || undefined
                }
            }),
        ])
            .then(([statsRes, papersRes]) => {
                setStats(statsRes.data);
                setPapers(papersRes.data.papers);
                setTotalPages(papersRes.data.pages);
                setTotalResults(papersRes.data.total);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [filter]);

    const fetchNotifications = () => {
        api.get('/notifications')
            .then(res => {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unread_count);
            })
            .catch(() => { });
    };

    useEffect(() => {
        fetchData();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [filter, debouncedSearch, page]);

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

    const handleAction = async (paperId, action, reason) => {
        if (action === 'delete') {
            if (!window.confirm('Are you sure you want to permanently delete this paper and its associated file? This action is irreversible.')) return;
        }

        try {
            if (action === 'approve') {
                await api.put(`/v1/internal/papers/${paperId}/approve`);
            } else if (action === 'reject') {
                await api.put(`/v1/internal/papers/${paperId}/reject`, { reason: reason || 'Rejected by admin' });
            } else if (action === 'delete') {
                await api.delete(`/v1/internal/papers/${paperId}`);
            }

            setPapers((prev) => prev.filter((p) => p.id !== paperId));
            const res = await api.get('/v1/internal/stats');
            setStats(res.data);
            setReviewPaper(null);
        } catch (err) {
            console.error('Action failed:', err);
            alert('Action failed');
        }
    };

    /* ─── If reviewing a paper, show the review page ─── */
    if (reviewPaper) {
        return (
            <ReviewPage
                paper={reviewPaper}
                pendingCount={stats?.pending ?? 0}
                onAction={handleAction}
                onBack={() => setReviewPaper(null)}
                user={user}
            />
        );
    }

    /* ─── Dashboard View ─── */
    return (
        <div className="min-h-screen flex bg-bg-main selection:bg-primary/20 transition-colors">
            {/* ─── Admin Sidebar ─── */}
            <aside className="hidden lg:flex w-72 flex-shrink-0 bg-bg-surface border-r border-border-main flex-col shadow-2xl z-30">
                <Link to="/" className="h-20 flex items-center px-8 border-b border-border-main bg-bg-main/30 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Knowledge Hub" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-display text-lg font-black tracking-tighter text-text-main flex items-center">
                                Knowledge<span className="text-primary ml-1">Hub</span>
                                <span className="ml-2 w-2 h-2 rounded-full bg-success animate-pulse" />
                            </h1>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] -mt-0.5 opacity-50">Authorized Admin</p>
                        </div>
                    </div>
                </Link>
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-border-main">
                    <p className="px-5 text-[10px] font-black text-text-muted/40 uppercase tracking-[0.25em] mb-4">Core Operative</p>
                    {adminNavMain.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end}
                            className={({ isActive }) => `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-black transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1' : 'text-text-muted hover:bg-bg-main hover:text-text-main hover:translate-x-1'}`}>
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-text-muted/50 group-hover:text-primary'}`}>{item.icon}</span>
                                    <span className="relative z-10">{item.label}</span>
                                    {item.badge && stats?.pending > 0 && (
                                        <span className="ml-auto bg-white text-primary text-[10px] font-black px-2.5 py-1 rounded-full shadow-inner">{stats.pending}</span>
                                    )}
                                    {isActive && (
                                        <div className="absolute top-0 right-0 w-12 h-full bg-white/10 blur-xl -mr-6" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                    <p className="px-5 text-[10px] font-black text-text-muted/40 uppercase tracking-[0.25em] mt-10 mb-4">Infrastructure</p>
                    {adminNavSystem.map((item) => (
                        <NavLink key={item.to} to={item.to}
                            className={({ isActive }) => `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-black transition-all duration-300 group ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1' : 'text-text-muted hover:bg-bg-main hover:text-text-main hover:translate-x-1'}`}>
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-text-muted/50 group-hover:text-primary'}`}>{item.icon}</span>
                                    <span className="relative z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-6 border-t border-border-main bg-bg-main/20">
                    <div className="flex items-center gap-4 p-3 rounded-2xl border border-border-main/50 bg-bg-surface hover:border-primary/20 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-bg-main flex items-center justify-center text-primary font-black text-lg border border-border-main group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-text-main truncate tracking-tight">{user?.name || 'Controller Admin'}</p>
                            <p className="text-[10px] font-bold text-text-muted truncate opacity-60">Master Authority</p>
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/5 rounded-lg transition-all">
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── Mobile Sidebar Overlay ─── */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-bg-main/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 bg-bg-surface border-r border-border-main flex flex-col shadow-2xl animate-slide-in-left">
                        <div className="h-20 flex items-center justify-between px-8 border-b border-border-main bg-bg-main/30">
                            <Link to="/" className="flex items-center gap-4">
                                <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                                    <img src="/logo.png" alt="Knowledge Hub" className="w-full h-full object-contain" />
                                </div>
                                <h1 className="font-display text-lg font-black tracking-tighter text-text-main">
                                    Knowledge<span className="text-primary ml-1">Hub</span>
                                </h1>
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-bg-main rounded-xl transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 custom-scrollbar">
                            <p className="px-5 text-[10px] font-black text-text-muted/40 uppercase tracking-[0.25em] mb-4">Core Operative</p>
                            {adminNavMain.map((item) => (
                                <NavLink key={item.to} to={item.to} end={item.end}
                                    className={({ isActive }) => `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-black transition-all duration-300 group relative ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}>
                                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.badge && stats?.pending > 0 && (
                                        <span className="ml-auto bg-white text-primary text-[10px] font-black px-2.5 py-1 rounded-full">{stats.pending}</span>
                                    )}
                                </NavLink>
                            ))}
                            <p className="px-5 text-[10px] font-black text-text-muted/40 uppercase tracking-[0.25em] mt-10 mb-4">Infrastructure</p>
                            {adminNavSystem.map((item) => (
                                <NavLink key={item.to} to={item.to}
                                    className={({ isActive }) => `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-black transition-all duration-300 group ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}>
                                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-6 border-t border-border-main bg-bg-main/20">
                            <div className="flex items-center gap-4 p-3 rounded-2xl border border-border-main/50 bg-bg-surface">
                                <div className="w-12 h-12 rounded-[1.25rem] bg-bg-main flex items-center justify-center text-primary font-black text-lg border border-border-main">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-black text-text-main truncate">{user?.name || 'Admin'}</p>
                                    <p className="text-[10px] font-bold text-text-muted truncate opacity-60">Authority Hub</p>
                                </div>
                                <button onClick={() => { logout(); navigate('/'); }} className="w-8 h-8 flex items-center justify-center text-text-muted">
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* ─── Main Content ─── */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-bg-surface/80 backdrop-blur-xl border-b border-border-main z-20 sticky top-0 transition-colors">
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                        <h2 className="text-lg lg:text-xl font-black text-text-main tracking-tighter uppercase whitespace-nowrap">{pageTitle}</h2>
                        <div className="hidden sm:block h-6 w-px bg-border-main mx-2" />
                        {!isUsersPage && !isAuditPage && !isSettingsPage && (
                            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-[0.2em] shadow-sm">Protocol v3.0.4</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-500 text-lg">search</span>
                            </span>
                            <input
                                className="pl-10 pr-4 py-1.5 w-64 text-sm bg-[#16202c] border-none rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-slate-500 text-white"
                                placeholder="Search globally..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-primary hover:bg-primary/5'}`}
                            >
                                <span className="material-symbols-outlined text-[26px]">notifications</span>
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-[9px] text-white flex items-center justify-center rounded-full border-2 border-bg-surface font-black animate-bounce">{unreadCount}</span>}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                    <div className="absolute right-0 mt-4 w-96 bg-bg-surface border border-border-main rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-fade-in">
                                        <div className="bg-bg-main/50 px-8 py-5 border-b border-border-main flex items-center justify-between">
                                            <h3 className="text-xs font-black text-text-main uppercase tracking-widest">Alerts Manifest</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-widest">Mark all read</button>
                                            )}
                                        </div>
                                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4 border border-border-main opacity-20">
                                                        <span className="material-symbols-outlined text-3xl">notifications_off</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-loose">No active signals detected in the archive queue.</p>
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
                                                            className={`p-6 hover:bg-bg-main/40 transition-all cursor-pointer group flex gap-5 relative ${!n.is_read ? 'bg-primary/5' : ''}`}
                                                        >
                                                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-inner ${n.type === 'danger' ? 'bg-danger/10 text-danger' :
                                                                n.type === 'warning' ? 'bg-warning/10 text-warning' :
                                                                    n.type === 'success' ? 'bg-success/10 text-success' :
                                                                        'bg-primary/10 text-primary'
                                                                }`}>
                                                                <span className="material-symbols-outlined text-xl">{
                                                                    n.type === 'danger' ? 'error' :
                                                                        n.type === 'warning' ? 'warning' :
                                                                            n.type === 'success' ? 'verified' :
                                                                                'info'
                                                                }</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-[13px] font-black leading-tight ${!n.is_read ? 'text-text-main' : 'text-text-muted'}`}>{n.title}</p>
                                                                <p className="text-[11px] font-medium text-text-muted mt-1 line-clamp-2">{n.message}</p>
                                                                <p className="text-[9px] font-black text-text-muted/40 uppercase tracking-tighter mt-3 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-xs">schedule</span>
                                                                    {fmtDateLong(n.created_at)}
                                                                </p>
                                                            </div>
                                                            {!n.is_read && <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-bg-main/30 border-t border-border-main text-center">
                                            <button onClick={() => setShowNotifications(false)} className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-text-main transition-colors">Close Manifest</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-thin scrollbar-thumb-border-main scroll-smooth">
                    {isUsersPage ? <UserManagement /> :
                        isAuditPage ? <AuditLogs /> :
                            isSettingsPage ? <AdminSettings /> :
                                isPreferencesPage ? <Preferences /> : <>
                                    {/* ─── Stat Cards ─── */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-bg-surface p-7 rounded-[2.5rem] border border-border-main shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                    <span className="material-symbols-outlined text-2xl">library_books</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-success bg-success/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-xs">trending_up</span>
                                                    Synced
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Archive Size</p>
                                                <h3 className="text-3xl font-black text-text-main tracking-tight">{stats?.total_papers?.toLocaleString() ?? 'ERR_BUF'}</h3>
                                            </div>
                                        </div>

                                        <div className="bg-danger/5 p-7 rounded-[2.5rem] border border-danger/10 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className="p-3 bg-danger/20 rounded-2xl text-danger animate-pulse">
                                                    <span className="material-symbols-outlined text-2xl">priority_high</span>
                                                </div>
                                                <div className="text-[10px] font-black text-danger bg-danger/10 px-3 py-1 rounded-full uppercase tracking-widest">Action Required</div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-danger/60 uppercase tracking-[0.2em] mb-1">Queue Backlog</p>
                                                <h3 className="text-3xl font-black text-text-main tracking-tight">{stats?.pending ?? '0'}</h3>
                                            </div>
                                        </div>

                                        <div className="bg-bg-surface p-7 rounded-[2.5rem] border border-border-main shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className="p-3 bg-success/10 rounded-2xl text-success group-hover:bg-success group-hover:text-white transition-all duration-300">
                                                    <span className="material-symbols-outlined text-2xl">shield_check</span>
                                                </div>
                                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 italic">Verified</div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Authorized Data</p>
                                                <h3 className="text-3xl font-black text-text-main tracking-tight">{stats?.approved?.toLocaleString() ?? '0'}</h3>
                                            </div>
                                        </div>

                                        <div className="bg-bg-surface p-7 rounded-[2.5rem] border border-border-main shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                    <span className="material-symbols-outlined text-2xl">group_work</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Academic Node Count</p>
                                                <h3 className="text-3xl font-black text-text-main tracking-tight">{stats?.contributors?.toLocaleString() ?? '0'}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ─── Moderation Queue ─── */}
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-bg-surface px-8 py-6 rounded-[2.5rem] border border-border-main shadow-sm">
                                            <h3 className="text-lg font-black text-text-main flex items-center gap-3">
                                                Moderation Protocol Queue
                                                <span className="bg-bg-main text-text-muted text-[10px] px-3 py-1 rounded-full font-black border border-border-main uppercase tracking-widest">{stats?.pending ?? 0} Pending</span>
                                            </h3>
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="flex bg-bg-main p-1 rounded-2xl border border-border-main">
                                                    {['all', 'pending', 'approved'].map((f) => (
                                                        <button key={f} onClick={() => setFilter(f)}
                                                            className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${filter === f ? 'bg-bg-surface text-primary shadow-lg border border-border-main' : 'text-text-muted hover:text-text-main'}`}>
                                                            {f}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-bg-surface rounded-[2.5rem] border border-border-main shadow-xl overflow-hidden flex-1 relative transition-colors">
                                            {loading ? (
                                                <div className="p-24 text-center">
                                                    <div className="inline-block w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                    <p className="mt-4 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] animate-pulse">Syncing Database...</p>
                                                </div>
                                            ) : papers.length === 0 ? (
                                                <div className="p-24 flex flex-col items-center justify-center text-center opacity-40">
                                                    <div className="w-20 h-20 rounded-full bg-bg-main flex items-center justify-center mb-6">
                                                        <span className="material-symbols-outlined text-4xl text-success">verified</span>
                                                    </div>
                                                    <p className="text-base font-black text-text-main uppercase tracking-widest">Registry Clean</p>
                                                    <p className="text-[10px] font-bold text-text-muted mt-2">All pending academic materials have been processed.</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-bg-main/50 border-b border-border-main">
                                                                <th className="py-5 px-8 w-12 text-center transition-colors">
                                                                    <div className="relative flex items-center justify-center">
                                                                        <input
                                                                            className="peer w-5 h-5 rounded-lg border-2 border-text-muted/30 bg-bg-surface text-primary focus:ring-primary/20 transition-all cursor-pointer appearance-none checked:bg-primary checked:border-primary"
                                                                            type="checkbox"
                                                                        />
                                                                        <span className="material-symbols-outlined absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white text-[14px] transition-opacity">check</span>
                                                                    </div>
                                                                </th>
                                                                <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Academic Material</th>
                                                                <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Source Entity</th>
                                                                <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Division</th>
                                                                <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Registry Date</th>
                                                                <th className="py-5 px-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                                                <th className="py-5 px-10 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Direct Protocol</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border-main/50">
                                                            {papers.map((paper) => {
                                                                const dc = getDeptColor(paper.department?.code);
                                                                return (
                                                                    <tr key={paper.id} className="group hover:bg-bg-main/40 transition-all duration-300">
                                                                        <td className="py-5 px-8 text-center transition-colors">
                                                                            <div className="relative flex items-center justify-center">
                                                                                <input
                                                                                    className="peer w-5 h-5 rounded-lg border-2 border-text-muted/30 bg-bg-surface text-primary focus:ring-primary/20 transition-all cursor-pointer appearance-none checked:bg-primary checked:border-primary"
                                                                                    type="checkbox"
                                                                                />
                                                                                <span className="material-symbols-outlined absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white text-[14px] transition-opacity">check</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-5 px-6">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[13px] font-black text-text-main group-hover:text-primary transition-colors">{paper.title}</span>
                                                                                <span className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-tighter opacity-60">
                                                                                    {paper.subject_code} • {paper.exam_type} • Sem {paper.semester}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-5 px-6">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-xl bg-bg-main flex items-center justify-center text-[10px] text-primary font-black border border-border-main shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                                                    {paper.uploader?.name?.charAt(0).toUpperCase() || '?'}
                                                                                </div>
                                                                                <span className="text-[11px] font-black text-text-main/80">{paper.uploader?.name || 'Unknown Source'}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-5 px-6">
                                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${dc.text} ${dc.bg.replace('/30', '/10')} border-current opacity-70 group-hover:opacity-100 transition-opacity`}>
                                                                                {paper.department?.code || 'UA'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-5 px-6 text-[10px] font-black text-text-muted font-mono tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">{fmtDate(paper.created_at)}</td>
                                                                        <td className="py-5 px-6">
                                                                            <StatusBadge status={paper.status} />
                                                                        </td>
                                                                        <td className="py-5 px-10 text-right">
                                                                            <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 lg:translate-x-4 transition-all duration-300">
                                                                                {paper.status === 'pending' && (
                                                                                    <>
                                                                                        <button onClick={() => handleAction(paper.id, 'approve')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-success/10 text-success hover:bg-success hover:text-white border border-success/20 transition-all shadow-sm" title="Authorize">
                                                                                            <span className="material-symbols-outlined text-[18px]">verified</span>
                                                                                        </button>
                                                                                        <button onClick={() => handleAction(paper.id, 'reject')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/20 transition-all shadow-sm" title="Flag Rejection">
                                                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                                <button onClick={() => setReviewPaper(paper)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-main text-text-muted hover:text-primary hover:bg-primary/5 border border-border-main transition-all shadow-sm" title="Review Content">
                                                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                                </button>

                                                                                <button onClick={() => handleAction(paper.id, 'delete')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-danger/5 text-danger/40 hover:text-white hover:bg-danger border border-transparent hover:border-danger/20 transition-all" title="Purge Record">
                                                                                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            {papers.length > 0 && (
                                                <div className="px-8 py-5 border-t border-border-main flex flex-col sm:flex-row items-center justify-between bg-bg-main/20 gap-4">
                                                    <div className="text-[10px] font-black text-text-muted/60 uppercase tracking-[0.2em]">
                                                        Showing <span className="text-text-main font-black">{(page - 1) * 20 + 1}-{Math.min(page * 20, totalResults)}</span> of <span className="text-text-main font-black">{totalResults}</span> Results
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            disabled={page === 1}
                                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-surface border border-border-main text-text-muted hover:text-primary hover:border-primary/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="material-symbols-outlined">chevron_left</span>
                                                        </button>

                                                        <div className="flex items-center bg-bg-surface border border-border-main rounded-xl px-4 py-2">
                                                            <span className="text-[11px] font-black text-text-main tracking-tighter">
                                                                PAGE {page} <span className="text-text-muted mx-2">OF</span> {totalPages}
                                                            </span>
                                                        </div>

                                                        <button
                                                            disabled={page >= totalPages}
                                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-surface border border-border-main text-text-muted hover:text-primary hover:border-primary/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="material-symbols-outlined">chevron_right</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-12 pt-8 border-t border-border-main flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <div className="flex gap-8">
                                            <span className="flex items-center gap-2.5 text-[10px] font-black text-success uppercase tracking-widest"><span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />Infrastructure Active</span>
                                            <span className="flex items-center gap-2.5 text-[10px] font-black text-primary uppercase tracking-widest"><span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.4)]" />Data Nodes Synced</span>
                                        </div>
                                        <div className="text-[10px] font-black text-text-muted/40 uppercase tracking-[0.2em]">© 2025 PYQ Control Center • Secure Administrative Instance</div>
                                    </div>
                                </>}
                </div>
            </main>
        </div>
    );
}
