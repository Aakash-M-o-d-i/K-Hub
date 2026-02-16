import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const medalStyles = {
    1: { bg: 'bg-gradient-to-b from-yellow-400 to-yellow-600', ring: 'ring-gold', shadow: 'shadow-glow-gold', icon: '🥇', height: 'h-48' },
    2: { bg: 'bg-gradient-to-b from-gray-300 to-gray-500', ring: 'ring-silver', shadow: '', icon: '🥈', height: 'h-40' },
    3: { bg: 'bg-gradient-to-b from-amber-600 to-amber-800', ring: 'ring-bronze', shadow: '', icon: '🥉', height: 'h-36' },
};

export default function ScholarLeaderboard() {
    const [scholars, setScholars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');
    const { user } = useAuth();

    useEffect(() => {
        setLoading(true);
        api.get('/leaderboard/scholars', { params: { limit: 20, period } })
            .then((res) => setScholars(res.data.scholars))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [period]);

    const top3 = scholars.slice(0, 3);
    const rest = scholars.slice(3);
    // Reorder for podium display: silver(2nd), gold(1st), bronze(3rd)
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    const currentUserRank = scholars.find((s) => s.user.id === user?.id);

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main text-text-main">
            {/* Hero */}
            <div className="bg-primary text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h1 className="font-display text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                        Scholar Rank Leaderboard
                    </h1>
                    <p className="text-white/80 max-w-xl mx-auto text-lg">
                        Honoring the top contributors who power the largest academic resource repository.
                    </p>

                    {/* Period toggle */}
                    <div className="flex items-center justify-center gap-3 mt-10">
                        {['all', 'weekly'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all
                  ${period === p
                                        ? 'bg-white text-primary shadow-xl scale-105'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                {p === 'all' ? 'Current All-Time' : 'This Week'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-10 mb-20 relative z-20">
                {loading ? (
                    <div className="bg-bg-surface rounded-3xl border border-border-main p-20 text-center shadow-xl">
                        <div className="inline-block w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="mt-4 text-text-muted font-bold uppercase tracking-widest text-xs">Fetching Rankings...</p>
                    </div>
                ) : (
                    <>
                        {/* Podium */}
                        {top3.length > 0 && (
                            <div className="flex items-end justify-center gap-4 lg:gap-8 mb-16">
                                {podiumOrder.map((scholar, idx) => {
                                    if (!scholar) return null;
                                    const rank = scholar.rank;
                                    const style = medalStyles[rank];
                                    return (
                                        <div key={scholar.user.id} className="flex flex-col items-center group">
                                            {/* Avatar Container */}
                                            <div className="relative mb-4">
                                                <div className={`w-20 h-20 lg:w-28 lg:h-28 rounded-full ${style.bg} flex items-center justify-center text-white text-3xl lg:text-4xl font-black ring-8 ${style.ring} ${style.shadow} transition-transform group-hover:scale-110 duration-500`}>
                                                    {scholar.user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-bg-surface border border-border-main rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg">
                                                    {style.icon}
                                                </div>
                                            </div>

                                            <div className="text-center mb-6">
                                                <p className="font-black text-text-main text-sm lg:text-base mb-0.5">{scholar.user.name}</p>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{scholar.user.department?.code || 'GEN'}</p>
                                            </div>

                                            {/* Podium bar */}
                                            <div className={`w-28 lg:w-36 ${style.height} ${style.bg} rounded-t-[2rem] flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden`}>
                                                <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                                                <p className="font-display font-black text-2xl lg:text-3xl relative z-10">{scholar.points}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 relative z-10">Points</p>
                                                <div className="mt-4 py-1 px-3 bg-white/10 rounded-full text-[10px] font-bold relative z-10">
                                                    {scholar.uploads} Uploads
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Table */}
                        {rest.length > 0 && (
                            <div className="bg-bg-surface rounded-[2.5rem] border border-border-main overflow-hidden shadow-sm">
                                <div className="px-8 py-6 border-b border-border-main bg-bg-main/50">
                                    <h2 className="font-black text-text-main text-lg tracking-tight">Community Contributors</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-bg-main/30 border-b border-border-main">
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Rank</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Scholar</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Major Branch</th>
                                                <th className="px-8 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Activity</th>
                                                <th className="px-8 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Credit Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-main">
                                            {rest.map((scholar) => (
                                                <tr key={scholar.user.id} className="hover:bg-bg-main/50 transition-colors group">
                                                    <td className="px-8 py-5 font-black text-text-muted group-hover:text-primary transition-colors">#{scholar.rank}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary text-xs">
                                                                {scholar.user.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-text-main">{scholar.user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-text-muted font-medium">{scholar.user.department?.name || '—'}</td>
                                                    <td className="px-8 py-5 text-center font-bold text-text-main">{scholar.uploads} <span className="text-[10px] text-text-muted">FILES</span></td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className="font-black text-primary text-lg">{scholar.points}</span>
                                                        <span className="text-[10px] font-bold text-text-muted ml-1">PTS</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Sticky user rank footer */}
            {currentUserRank && (
                <div className="sticky bottom-4 mx-6 mb-4 max-w-5xl lg:mx-auto bg-bg-surface/80 backdrop-blur-xl border border-border-main rounded-[2rem] shadow-2xl shadow-primary/10 animate-fade-in-up">
                    <div className="px-8 py-5 flex items-center gap-6">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-2xl">leaderboard</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-black text-text-main text-sm uppercase tracking-tight">Your Identity Rank: <span className="text-primary ml-1">#{currentUserRank.rank}</span></p>
                                <span className="text-xs font-bold text-text-muted">{currentUserRank.points} / 1000 PTS</span>
                            </div>
                            <div className="h-2.5 bg-bg-main rounded-full overflow-hidden border border-border-main">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.4)]"
                                    style={{ width: `${Math.min(100, (currentUserRank.points / 1000) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
