import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DEPT_ICONS = ['computer', 'settings_suggest', 'architecture', 'bolt', 'science', 'biotech', 'calculate', 'psychology'];
const DEPT_COLORS = [
    { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
    { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-500' },
    { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', bar: 'bg-yellow-500' },
    { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', bar: 'bg-teal-500' },
    { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500' },
    { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' },
    { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-500' },
    { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', bar: 'bg-pink-500' },
];
const RANK_COLORS = ['text-warning', 'text-text-muted', 'text-amber-700'];

export default function DepartmentalClash() {
    const [departments, setDepartments] = useState([]);
    const [scholars, setScholars] = useState([]);
    const [sortBy, setSortBy] = useState('papers');
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        season_name: 'Departmental Clash',
        season_year: '2025',
        season_end_date: '',
        clash_subtitle: 'The battle for academic supremacy is on.',
        hierarchy_title: 'Department Hierarchy',
        sortBy_volume_label: 'By Volume',
        sortBy_momentum_label: 'By Momentum',
        elite_rank_label: 'Elite Rank #1',
        scholars_active_label: 'scholars active'
    });

    useEffect(() => {
        Promise.all([
            api.get('/leaderboard/departments'),
            api.get('/leaderboard/scholars?limit=10'),
            api.get('/leaderboard/config'),
        ]).then(([deptRes, scholarsRes, configRes]) => {
            setDepartments(deptRes.data.departments || []);
            setScholars(scholarsRes.data.scholars || []);
            setConfig(configRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const getDaysRemaining = () => {
        if (!config.season_end_date) return 0;
        const end = new Date(config.season_end_date);
        const now = new Date();
        const diff = end - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    
    const daysRemaining = getDaysRemaining();


    const sorted = [...departments].sort((a, b) =>
        sortBy === 'papers' ? b.total_papers - a.total_papers : b.total_points - a.total_points,
    );

    const top = sorted[0];
    const second = sorted[1];
    const runners = sorted.slice(1, 5);


    const topPapers = top?.total_papers || 1;
    const secondPapers = second?.total_papers || 0;
    const total = topPapers + secondPapers || 1;
    const topPct = Math.round((topPapers / total) * 100);
    const secondPct = 100 - topPct;
    const lead = topPapers - secondPapers;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Header */}
                <header className="mb-8 text-center md:text-left md:flex md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-text-main mb-2 uppercase tracking-tight">
                            {config.season_name} <span className="text-primary">{config.season_year}</span>
                        </h1>
                        <p className="text-text-muted font-bold opacity-60 max-w-2xl">
                            {config.clash_subtitle}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-2 bg-danger/10 text-danger px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-danger/20">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        Season ends in {daysRemaining} days
                    </div>
                </header>

                {/* Clash Meter - Tug of War */}
                {top && second && (
                    <section className="bg-bg-surface rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-border-main mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                        <div className="flex justify-between items-end mb-6 z-10 relative">
                            <div className="text-left">
                                <div className="text-2xl font-black text-primary uppercase tracking-tight">{top.department?.name}</div>
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Leading by {lead} papers</div>
                            </div>
                            <div className="bg-bg-main px-4 py-1.5 rounded-full text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border border-border-main">
                                Vs
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-text-main uppercase tracking-tight opacity-80">{second.department?.name}</div>
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60 text-right">Chasing closely</div>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="relative h-8 w-full bg-bg-main rounded-2xl overflow-hidden flex border border-border-main shadow-inner">
                            <div
                                className="h-full bg-primary flex items-center justify-start px-4 text-[11px] font-black text-white transition-all duration-1000 relative overflow-hidden"
                                style={{ width: `${topPct}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                                <span className="relative z-10">{topPct}%</span>
                            </div>
                            <div className="w-6 h-full bg-bg-surface skew-x-[-25deg] absolute z-10 border-r-4 border-bg-surface"
                                style={{ left: `${topPct - 1.5}%` }}
                            />
                            <div className="h-full bg-text-muted/20 flex items-center justify-end px-4 text-[11px] font-black text-text-main flex-grow transition-all duration-1000">
                                {secondPct}%
                            </div>
                        </div>
                        <div className="mt-6 flex gap-6 overflow-x-auto pb-2 border-t border-border-main/50 pt-4">
                            <div className="flex items-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
                                <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                <span className="text-text-main">{top.department?.code}</span> gained +{top.total_papers} total
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
                                <span className="w-2.5 h-2.5 rounded-full bg-warning shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                                <span className="text-text-main">{second.department?.code}</span> {sortBy === 'papers' ? 'chasing with' : 'points:'} {sortBy === 'papers' ? second.total_papers : second.total_points}
                            </div>
                        </div>
                    </section>
                )}

                {/* Split View Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT: Top Contributors */}
                    <div className="lg:col-span-5 flex flex-col bg-bg-surface rounded-3xl border border-border-main shadow-xl shadow-black/5 overflow-hidden">
                        <div className="p-8 border-b border-border-main bg-gradient-to-br from-primary/5 to-transparent relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8" />
                            <h2 className="text-sm font-black flex items-center gap-2 text-text-main uppercase tracking-widest">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                Top Contributors
                            </h2>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1.5 opacity-60">Heroes of the week</p>
                        </div>

                        <div className="flex-grow p-6 space-y-4">
                            {scholars.length === 0 && (
                                <p className="text-center text-text-muted font-bold py-12 opacity-50 uppercase tracking-[0.2em] text-[10px]">No activity detected yet.</p>
                            )}
                            {scholars.slice(0, 5).map((s, i) => (
                                <div key={s.user.id}
                                    className="group flex items-center p-4 rounded-2xl hover:bg-bg-main transition-all duration-300 cursor-pointer border border-transparent hover:border-border-main relative overflow-hidden"
                                >
                                    <div className={`flex-shrink-0 w-8 text-center font-black text-xl ${i < 3 ? RANK_COLORS[i] : 'text-text-muted opacity-40 text-sm'}`}>
                                        #{i + 1}
                                    </div>
                                    <div className="relative mx-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-110 duration-500
                                            ${i === 0 ? 'bg-warning/10 text-warning border-2 border-warning/30' :
                                                i === 1 ? 'bg-text-muted/10 text-text-muted border-2 border-text-muted/30' :
                                                    i === 2 ? 'bg-amber-600/10 text-amber-700 border-2 border-amber-600/30' :
                                                        'bg-primary/10 text-primary border border-primary/20'}`}
                                        >
                                            {s.user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        {i < 3 && (
                                            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-bg-surface
                                                ${i === 0 ? 'bg-warning text-white' : i === 1 ? 'bg-text-muted text-white' : 'bg-amber-700 text-white'}`}>
                                                {i === 0 ? '1' : i === 1 ? '2' : '3'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-black text-text-main truncate tracking-tight">{s.user.name}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60 truncate">{s.user.department?.code || 'Neutral'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black ${i < 3 ? 'text-primary' : 'text-text-main opacity-80'}`}>{s.uploads}</p>
                                        <p className="text-[8px] uppercase font-black text-text-muted tracking-widest opacity-50">Papers</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-border-main bg-bg-main/50 text-center">
                            <Link 
                                to="/contributors" 
                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:tracking-[0.15em] transition-all flex items-center justify-center gap-2 group w-full"
                            >
                                View Full Directory
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT: Department Ranking */}
                    <div className="lg:col-span-7 flex flex-col space-y-6">
                        {/* Section Header */}
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-sm font-black flex items-center gap-2 text-text-main uppercase tracking-widest">
                                <span className="material-symbols-outlined text-primary">domain</span>
                                {config.hierarchy_title}
                            </h2>
                            <div className="flex gap-2 bg-bg-surface p-1 rounded-xl border border-border-main">
                                <button
                                    onClick={() => setSortBy('papers')}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${sortBy === 'papers'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-text-muted hover:text-text-main'}`}
                                >
                                    {config.sortBy_volume_label}
                                </button>
                                <button
                                    onClick={() => setSortBy('activity')}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${sortBy === 'activity'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-text-muted hover:text-text-main'}`}
                                >
                                    {config.sortBy_momentum_label}
                                </button>
                            </div>
                        </div>

                        {/* #1 Featured Card */}
                        {top && (
                            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] p-8 shadow-2xl shadow-primary/20 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-[0.02] rounded-full -ml-24 -mb-24" />
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                                        <span className="material-symbols-outlined text-5xl text-white">{DEPT_ICONS[top.department?.id % DEPT_ICONS.length]}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-white/20 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-white/20">{config.elite_rank_label}</span>
                                            <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-white/80">
                                                <span className="material-symbols-outlined text-base mr-1.5 text-success">trending_up</span>
                                                {top.contributors} {config.scholars_active_label}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tight uppercase">{top.department?.name}</h3>
                                        <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mt-1">
                                            {top.total_papers.toLocaleString()} Modules Internalized
                                        </p>
                                    </div>
                                    <div className="text-center hidden md:block">
                                        <div className="text-4xl font-black tracking-tighter">{top.total_papers.toLocaleString()}</div>
                                        <div className="text-[9px] uppercase font-black tracking-[0.2em] opacity-60">Total Nodes</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Runner-ups Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2 pb-2">
                            {runners.map((dept, i) => {
                                const colorSet = DEPT_COLORS[(i + 1) % DEPT_COLORS.length];
                                const icon = DEPT_ICONS[(i + 1) % DEPT_ICONS.length];
                                const maxPapers = top?.total_papers || 1;
                                const barWidth = Math.max(10, Math.round((dept.total_papers / maxPapers) * 100));

                                return (
                                    <div key={dept.department?.id || i}
                                        className="bg-bg-surface p-6 rounded-[1.5rem] border border-border-main shadow-xl shadow-black/5 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group/card"
                                    >
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-bg-main rounded-bl-[2rem] -mr-6 -mt-6 opacity-50 group-hover/card:bg-primary/5 transition-colors" />
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`${colorSet.bg} p-4 rounded-xl ${colorSet.text} shadow-sm`}>
                                                <span className="material-symbols-outlined text-2xl">{icon}</span>
                                            </div>
                                            <span className="text-4xl font-black text-text-muted opacity-10 tracking-tighter group-hover/card:opacity-20 transition-opacity">#{i + 2}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-text-main tracking-tight uppercase">{dept.department?.name}</h4>
                                        <div className="flex items-end justify-between mt-6">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60 mb-2">{dept.total_papers} Nodes</p>
                                                <div className="w-full h-2 bg-bg-main rounded-full overflow-hidden border border-border-main/50">
                                                    <div className={`h-full ${colorSet.bar} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.2)]`} style={{ width: `${barWidth}%` }} />
                                                </div>
                                            </div>
                                            <div className="ml-4 flex items-center gap-1.5 px-2 py-1 bg-success/10 text-success rounded-lg border border-success/20">
                                                <span className="material-symbols-outlined text-xs">group</span>
                                                <span className="text-[10px] font-black">{dept.contributors}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {runners.length === 0 && (
                                <div className="sm:col-span-2 text-center text-text-muted py-20 bg-bg-surface rounded-3xl border border-border-main/50 border-dashed">
                                    <span className="material-symbols-outlined text-6xl opacity-20 mb-4 block">query_stats</span>
                                    <p className="font-black uppercase tracking-widest text-[10px] opacity-40 text-center">Inconclusive data points detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
