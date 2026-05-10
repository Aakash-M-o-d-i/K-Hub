import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const RANK_BADGES = {
    1: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'Grand Scholar' },
    2: { color: 'text-text-muted', bg: 'bg-text-muted/10', border: 'border-text-muted/30', label: 'Master' },
    3: { color: 'text-amber-700', bg: 'bg-amber-700/10', border: 'border-amber-700/30', label: 'Expert' }
};

export default function ContributorLeaderboard() {
    const [scholars, setScholars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 13;

    useEffect(() => {
        api.get('/leaderboard/scholars?limit=100')
            .then(res => {
                setScholars(res.data.scholars || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);


    const totalPages = Math.ceil(scholars.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedScholars = scholars.slice(startIndex, startIndex + pageSize);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-bg-main min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-bg-main min-h-screen pb-20">
            {/* Header Section */}
            <div className="relative bg-bg-surface border-b border-border-main py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/" className="text-primary hover:underline text-sm font-black uppercase tracking-widest flex items-center gap-1">
                            <span className="material-icons text-sm">arrow_back</span>
                            Home
                        </Link>
                        <span className="text-text-muted/30">/</span>
                        <span className="text-text-muted text-sm font-black uppercase tracking-widest">Full Directory</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-text-main tracking-tight uppercase leading-none mb-6">
                        Top <span className="text-primary">Contributors</span>
                    </h1>
                    <p className="text-text-muted font-bold text-lg max-w-2xl">
                        Recognizing the students who fuel our academic ecosystem. Every paper uploaded is a step towards collective excellence.
                    </p>
                </div>
            </div>

            {/* List Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="bg-[#0f172a] rounded-[2rem] border border-white/5 shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Rank</th>
                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Contributor</th>
                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Semester</th>
                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Department</th>
                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] text-right">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedScholars.map((s, i) => {
                                    const rank = startIndex + i + 1;
                                    const badge = RANK_BADGES[rank];
                                    
                                    return (
                                        <tr key={s.user.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                {badge ? (
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg ${badge.bg} ${badge.border} border ${badge.color} text-[8px] font-black uppercase tracking-widest whitespace-nowrap`}>
                                                        #{rank} {badge.label}
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-black text-slate-700 px-2">#{rank}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xl border border-white/10 group-hover:border-primary/50 transition-all duration-500 bg-slate-900 overflow-hidden text-white">
                                                            {s.user.avatar_url ? (
                                                                <img src={s.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                s.user.name?.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        {rank <= 3 && (
                                                            <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black border border-slate-900 ${badge.bg.replace('/10', '')} text-white`}>
                                                                {rank}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-200 group-hover:text-primary transition-colors leading-none mb-1">{s.user.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Verified Member</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center px-2 py-0.5 bg-primary/5 text-primary rounded-md border border-primary/10 text-[9px] font-black uppercase tracking-widest">
                                                    {s.user.semester ? `Semester ${s.user.semester}` : 'General'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">
                                                    {s.user.department?.name || 'Academic Common'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-white leading-none">{s.uploads}</span>
                                                        <span className="text-[7px] font-black text-primary uppercase tracking-tighter">Pts</span>
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-40 mt-1">Total Papers</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="bg-white/[0.01] border-t border-white/5 px-8 py-6 flex items-center justify-between">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-white">{startIndex + 1}-{Math.min(startIndex + pageSize, scholars.length)}</span> of <span className="text-white">{scholars.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
                            >
                                <span className="material-icons text-sm">chevron_left</span>
                            </button>
                            
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[11px] font-black transition-all
                                        ${currentPage === i + 1 
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                            : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
                            >
                                <span className="material-icons text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-12 flex justify-center">
                    <button 
                        onClick={scrollToTop}
                        className="bg-bg-surface border border-border-main px-8 py-4 rounded-2xl flex items-center gap-3 group hover:border-primary transition-all shadow-xl shadow-black/5"
                    >
                        <span className="text-[11px] font-black text-text-muted group-hover:text-primary uppercase tracking-[0.3em] transition-all">Back to Top</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-icons text-sm">arrow_upward</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
