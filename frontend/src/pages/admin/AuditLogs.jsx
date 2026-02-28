import { useState, useEffect } from 'react';
import api from '../../api/axios';

/* ────────────── helpers ────────────── */

const ACTION_META = {
    approve: { icon: 'check_circle', color: 'text-success', bg: 'bg-success/10 shadow-success/10', label: 'Approved' },
    reject: { icon: 'cancel', color: 'text-danger', bg: 'bg-danger/10 shadow-danger/10', label: 'Rejected' },
    update_role: { icon: 'admin_panel_settings', color: 'text-primary', bg: 'bg-primary/10 shadow-primary/10', label: 'Role Update' },
    delete_paper: { icon: 'delete', color: 'text-warning', bg: 'bg-warning/10 shadow-warning/10', label: 'Deleted' },
};

function getActionMeta(action) {
    return ACTION_META[action] || { icon: 'info', color: 'text-text-muted', bg: 'bg-bg-main shadow-transparent', label: action };
}

function fmtDateOnly(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(/\//g, '/');
}

function fmtTimeOnly(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: false
    });
}

/* ────────────── filters ────────────── */

const FILTER_OPTIONS = [
    { value: '', label: 'All Actions' },
    { value: 'approve', label: 'Approvals' },
    { value: 'reject', label: 'Rejections' },
    { value: 'update_role', label: 'Role Changes' },
];

/* ────────────── component ────────────── */

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [actionFilter, setActionFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const perPage = 15;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/v1/internal/audit-logs', {
                params: {
                    page,
                    per_page: perPage,
                    action: actionFilter || undefined,
                    search: debouncedSearch || undefined
                },
            });
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
            setTotalCount(res.data.total);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, [page, actionFilter, debouncedSearch]);

    const handleFilterChange = (val) => {
        setActionFilter(val);
        setPage(1);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
                    <div>
                        <h3 className="text-2xl font-black text-text-main tracking-tight">Audit Trail</h3>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">System Operational Logs</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Search bar */}
                    <div className="relative min-w-[300px] group">
                        <span className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Identify Entry By Subject, IP, Or Epoch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-bg-surface border border-border-main rounded-2xl pl-14 pr-12 py-3.5 text-[13px] font-black text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-[0.2em] shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-4 flex items-center text-text-muted hover:text-danger transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        )}
                    </div>

                    {/* Action filter */}
                    <div className="relative group">
                        <select
                            value={actionFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="appearance-none bg-bg-surface border border-border-main rounded-2xl pl-5 pr-12 py-3.5 text-[10px] font-black text-text-main uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary cursor-pointer transition-all shadow-sm"
                        >
                            {FILTER_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-bg-surface text-text-main">{opt.label}</option>
                            ))}
                        </select>
                        <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted transition-colors">
                            <span className="material-symbols-outlined text-xl">expand_more</span>
                        </span>
                    </div>

                    <button
                        onClick={fetchLogs}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-bg-surface border border-border-main text-text-muted hover:text-primary hover:bg-bg-main transition-all shadow-sm group"
                        title="Sync Records"
                    >
                        <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-700">refresh</span>
                    </button>
                </div>
            </div>

            {/* Audit Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-bg-surface rounded-[2.5rem] border border-border-main shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-bg-main overflow-hidden">
                        <div className="w-1/3 h-full bg-primary animate-[shimmer_2s_infinite]" />
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg shadow-primary/10" />
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Data Streams</p>
                    </div>
                </div>
            ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-bg-surface rounded-[2.5rem] border border-dashed border-border-main shadow-inner transition-colors">
                    <div className="w-20 h-20 rounded-3xl bg-bg-main flex items-center justify-center mb-6 border border-border-main shadow-sm transform hover:rotate-12 transition-transform duration-500">
                        <span className="material-symbols-outlined text-4xl text-text-muted opacity-40">history</span>
                    </div>
                    <p className="text-[11px] font-black text-text-main uppercase tracking-widest">No Operational Telemetry Located</p>
                    <p className="text-[10px] text-text-muted mt-2 font-bold uppercase tracking-tight opacity-50">Filter calibration required</p>
                </div>
            ) : (
                <>
                    <div className="bg-bg-surface rounded-[2.5rem] border border-border-main shadow-xl overflow-hidden relative">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border-main">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-main bg-bg-main/30">
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Timestamp</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Action Protocol</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Admin Profile</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Target Entity</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Node Address</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Protocol Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-main/50">
                                    {logs.map((log) => {
                                        const meta = getActionMeta(log.action);
                                        return (
                                            <tr key={log.id} className="hover:bg-bg-main/40 transition-all group duration-300">
                                                {/* Timestamp */}
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-black text-text-main tracking-tight group-hover:text-primary transition-colors">{fmtDateOnly(log.created_at)}</span>
                                                        <span className="text-[10px] text-text-muted font-black mt-1 opacity-60 uppercase tracking-tighter">{fmtTimeOnly(log.created_at)}</span>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-11 w-11 rounded-2xl ${meta.bg} flex items-center justify-center border border-border-main group-hover:scale-110 transition-transform shadow-lg`}>
                                                            <span className={`material-symbols-outlined text-xl ${meta.color}`}>{meta.icon}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-black text-text-main tracking-tight">{meta.label}</span>
                                                            <span className="text-[9px] text-text-muted uppercase font-black tracking-widest opacity-50">{log.action.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Admin */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-9 w-9 rounded-xl bg-bg-main flex items-center justify-center text-[11px] font-black text-text-main border border-border-main shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                            {(log.admin_name || 'A').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-[12px] font-black text-text-muted group-hover:text-text-main transition-colors tracking-tight">
                                                            {log.admin_name || `Admin Node ${log.admin_id}`}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Target */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col gap-2">
                                                        {log.target_paper_id && (
                                                            <span className="inline-flex items-center px-4 py-1 rounded-xl text-[9px] font-black bg-primary/5 text-primary border border-primary/20 uppercase tracking-widest shadow-sm">
                                                                VEC-PAPER-{log.target_paper_id}
                                                            </span>
                                                        )}
                                                        {log.target_user_id && (
                                                            <span className="inline-flex items-center px-4 py-1 rounded-xl text-[9px] font-black bg-purple-500/5 text-purple-500 border border-purple-500/20 uppercase tracking-widest shadow-sm">
                                                                USR-NODE-{log.target_user_id}
                                                            </span>
                                                        )}
                                                        {!log.target_paper_id && !log.target_user_id && (
                                                            <span className="text-text-muted/40 font-black text-[10px] tracking-widest px-2">NIL_REF</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* IP Address */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <span className="text-[10px] font-black text-text-muted bg-bg-main px-3 py-1.5 rounded-xl border border-border-main font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {log.ip_address || '0.0.0.0'}
                                                    </span>
                                                </td>

                                                {/* Reason */}
                                                <td className="px-8 py-6">
                                                    <p className="text-[11px] font-bold text-text-muted max-w-[240px] truncate group-hover:text-text-main transition-colors" title={log.reason || ''}>
                                                        {log.reason || <span className="text-text-muted/30 italic font-medium">Automatic protocol resolution</span>}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-2 py-10">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">
                                Shift {page} Of {totalPages} <span className="mx-3 text-border-main">•</span> {totalCount.toLocaleString()} Pulse Records
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="h-12 px-6 rounded-2xl text-text-muted hover:text-primary hover:bg-bg-main disabled:opacity-20 disabled:cursor-not-allowed border border-border-main transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-sm group"
                                >
                                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                    Retract
                                </button>
                                <div className="flex items-center gap-2 bg-bg-surface p-1.5 rounded-2xl border border-border-main shadow-inner">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let p;
                                        if (totalPages <= 5) p = i + 1;
                                        else if (page <= 3) p = i + 1;
                                        else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                        else p = page - 2 + i;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${p === page ? 'bg-primary text-white shadow-xl shadow-primary/20 border border-primary' : 'text-text-muted hover:bg-bg-main hover:text-primary'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="h-12 px-6 rounded-2xl text-text-muted hover:text-primary hover:bg-bg-main disabled:opacity-20 disabled:cursor-not-allowed border border-border-main transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-sm group"
                                >
                                    Advance
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
