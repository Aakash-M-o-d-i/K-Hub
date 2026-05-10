import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

function Profile() {
    const { user, refreshUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const isCompleteProfile = searchParams.get('complete') === '1';
    const profileIncomplete = !user?.department_id || !user?.semester || !user?.phone_number;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roll_no: '',
        department_id: '',
        year: '',
        semester: '',
        phone_number: '',
        bio: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                roll_no: user.roll_no || '',
                department_id: user.department_id || '',
                year: user.year || '',
                semester: user.semester || '',
                phone_number: user.phone_number || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    useEffect(() => {
        api.get('/papers/departments')
            .then(res => setDepartments(res.data.departments))
            .catch(() => { });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/auth/me', formData);
            await refreshUser();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            if (searchParams.has('complete')) {
                searchParams.delete('complete');
                setSearchParams(searchParams, { replace: true });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main scrollbar-thin scrollbar-thumb-border-main scrollbar-track-transparent">
            {/* Complete Profile Banner for Google OAuth users */}
            {(isCompleteProfile || profileIncomplete) && user.oauth_provider && (
                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20 px-6 py-5 animate-fade-in-up">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-2xl">waving_hand</span>
                            </div>
                            <div>
                                <h3 className="font-black text-sm text-text-main">Welcome to Knowledge Hub! Complete your profile</h3>
                                <p className="text-xs text-text-muted font-medium mt-0.5">
                                    Add your department, semester, and phone number to get full access to all features.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {[
                                { label: 'Department', done: !!user.department_id },
                                { label: 'Semester', done: !!user.semester },
                                { label: 'Phone', done: !!user.phone_number },
                            ].map((item) => (
                                <span key={item.label} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                    item.done
                                        ? 'bg-success/10 text-success border-success/20'
                                        : 'bg-danger/10 text-danger border-danger/20 animate-pulse'
                                }`}>
                                    {item.done ? '✓' : '!'} {item.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
                        <div>
                            <h1 className="text-2xl font-black text-text-main tracking-tight uppercase">Profile Identity Hub</h1>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">Academic Metadata & Reputation Tracking</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 px-5 bg-bg-surface border border-border-main text-text-muted hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group shadow-sm transition-all duration-300">
                            <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">lock</span>
                            Change Password
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-10 px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                        >
                            {saving ? 'Synchronizing...' : 'Edit Profile'}
                            {!saving && <span className="material-symbols-outlined text-lg">edit</span>}
                        </button>
                    </div>
                </div>

                {/* Identity Card: Info + Stats */}
                <div className="bg-bg-surface border border-border-main rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 group relative">
                    <div className="h-32 bg-gradient-to-r from-primary/5 via-blue-500/5 to-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                    </div>

                    <div className="px-10 pb-8 -mt-16 relative z-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative group/avatar">
                                <div className="w-44 h-44 bg-bg-surface rounded-full p-2 shadow-2xl shadow-black/10 transform transition-transform group-hover/avatar:scale-105">
                                    <div className="w-full h-full bg-slate-50 dark:bg-bg-main border-2 border-primary/20 rounded-full flex items-center justify-center text-primary text-6xl font-black overflow-hidden relative">
                                        <div className="absolute inset-0 bg-primary/5" />
                                        <span className="relative z-10">{user.name?.charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 w-7 h-7 bg-success border-4 border-white dark:border-bg-surface rounded-full shadow-lg shadow-success/20 animate-pulse" />
                            </div>

                            <div className="flex-1 mt-20">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-text-main tracking-tight">{user.name}</h2>
                                        <p className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest opacity-70">
                                            <span className="material-symbols-outlined text-lg text-primary">school</span>
                                            {user.department?.name || 'No Department'}{user.semester ? `, Semester ${user.semester}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {user.is_top_contributor && (
                                            <span className="px-5 py-2 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20 flex items-center gap-2 shadow-sm">
                                                <span className="material-symbols-outlined text-base">verified</span> Top Contributor
                                            </span>
                                        )}
                                        {user.is_beta_tester && (
                                            <span className="px-5 py-2 bg-warning/10 text-warning text-[9px] font-black uppercase tracking-widest rounded-full border border-warning/20 flex items-center gap-2 shadow-sm">
                                                <span className="material-symbols-outlined text-base">auto_awesome</span> Beta Tester
                                            </span>
                                        )}
                                        {user.total_uploads >= 50 && (
                                            <span className="px-5 py-2 bg-success/10 text-success text-[9px] font-black uppercase tracking-widest rounded-full border border-success/20 flex items-center gap-2 shadow-sm">
                                                <span className="material-symbols-outlined text-base">workspace_premium</span> Master Contributor
                                            </span>
                                        )}
                                        {user.total_uploads >= 10 && user.total_uploads < 50 && (
                                            <span className="px-5 py-2 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20 flex items-center gap-2 shadow-sm">
                                                <span className="material-symbols-outlined text-base">star</span> Rising Star
                                            </span>
                                        )}
                                        {user.total_uploads >= 1 && user.total_uploads < 10 && (
                                            <span className="px-5 py-2 bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20 flex items-center gap-2 shadow-sm">
                                                <span className="material-symbols-outlined text-base">rocket_launch</span> First Step
                                            </span>
                                        )}
                                        {user.total_uploads === 0 && (
                                            <span className="px-5 py-2 bg-bg-main/50 text-text-muted text-[9px] font-black uppercase tracking-widest rounded-full border border-border-main flex items-center gap-2 shadow-sm opacity-60">
                                                <span className="material-symbols-outlined text-base">person</span> Contributor
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Shared Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                    {[
                                        { label: 'Total Uploads', value: user.total_uploads ?? 0, trend: user.total_uploads > 0 ? `${user.total_uploads}` : null, color: 'primary' },
                                        { label: 'Current Rank', value: user.rank ? `#${user.rank}` : 'Unranked', trend: user.rank && user.rank <= 10 ? 'Top 10' : null, color: 'success' },
                                        { label: 'Reputation', value: (user.total_points ?? 0).toLocaleString(), color: 'warning' },
                                        { label: 'Downloads', value: user.total_downloads ?? 0, color: 'primary' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-bg-main/30 p-4 rounded-2xl border border-border-main/50 group/stat hover:border-primary/30 transition-all">
                                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-60">{stat.label}</p>
                                            <div className="flex items-end justify-between">
                                                <h4 className="text-xl font-black text-text-main tracking-tighter">{stat.value}</h4>
                                                {stat.trend && (
                                                    <span className={`text-[8px] px-1.5 py-0.5 bg-${stat.color === 'success' ? 'success' : 'primary'}/10 text-${stat.color === 'success' ? 'success' : 'primary'} font-black rounded uppercase`}>
                                                        {stat.trend}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid: Form & Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mt-10">
                    {/* Personal Information (Left) */}
                    <div className="w-full">
                        <div className="bg-bg-surface rounded-3xl border border-border-main shadow-sm flex flex-col h-full overflow-hidden">
                            <div className="px-8 py-6 border-b border-border-main flex items-center justify-between">
                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Personal Information</h3>
                                <span className="text-[10px] font-black text-text-muted opacity-50 uppercase tracking-widest">Last updated 2 days ago</span>
                            </div>

                            <form className="p-8 space-y-8" onSubmit={handleSave}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Full Name</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">person</span>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-12 pr-6 py-3.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-bold text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                                placeholder="Alex Johnson"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Email Address</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40">alternate_email</span>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full pl-12 pr-6 py-3.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-bold text-text-main opacity-60 cursor-not-allowed"
                                                placeholder="alex.j@university.edu"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">University Roll No</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">numbers</span>
                                            <input
                                                type="text"
                                                value={formData.roll_no}
                                                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                                                className="w-full pl-12 pr-6 py-3.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-bold text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                                placeholder="CS-2021-042"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Department</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">hub</span>
                                            <select
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                                className="w-full pl-12 pr-10 py-3.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-bold text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Phone Number</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">call</span>
                                            <input
                                                type="text"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                className="w-full pl-12 pr-6 py-3.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-bold text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                                placeholder="1234567890"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Semester</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary transition-all">school</span>
                                            <select
                                                value={formData.semester}
                                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                                className="w-full pl-12 pr-10 py-3.5 bg-bg-main border border-border-main rounded-xl text-[13px] font-bold text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Semester</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                    <option key={s} value={s}>Semester {s}</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60">Bio</label>
                                    <textarea
                                        rows="4"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full p-6 bg-bg-main border border-border-main rounded-2xl text-[13px] font-bold text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-sm"
                                        placeholder="Tell us about your academic interests..."
                                    />
                                </div>
                            </form>
                        </div>

                    </div>

                    {/* Premium GitHub-style Contribution Section */}
                    <div className="mt-8 bg-[#0d1117] rounded-xl border border-[#30363d] p-6 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-normal text-white">
                                <span className="font-bold">{user.total_uploads || 0} contributions - paper</span> in the last year
                            </h3>
                        </div>

                        <div className="border border-[#30363d] rounded-md p-5 bg-[#0d1117]">
                            <div className="flex gap-3">
                                {/* Day Labels (Sun-Sat) */}
                                <div className="grid grid-rows-7 gap-[4px] h-[108px] text-[10px] text-[#8b949e] select-none text-right w-8 mt-7">
                                    <span className="flex items-center justify-end">Sun</span>
                                    <span className="flex items-center justify-end">Mon</span>
                                    <span className="flex items-center justify-end">Tue</span>
                                    <span className="flex items-center justify-end">Wed</span>
                                    <span className="flex items-center justify-end">Thu</span>
                                    <span className="flex items-center justify-end">Fri</span>
                                    <span className="flex items-center justify-end">Sat</span>
                                </div>
                                
                                <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                                    {/* Month Labels Dynamic Alignment */}
                                    <div className="relative h-5 mb-2 text-[10px] text-[#8b949e] select-none min-w-[832px]">
                                        {Array.from({ length: 52 }).map((_, weekIndex) => {
                                            const date = new Date();
                                            date.setDate(date.getDate() - (51 - weekIndex) * 7);
                                            const month = date.toLocaleString('default', { month: 'short' });
                                            const isFirstWeekOfMonth = date.getDate() <= 7;
                                            
                                            if (!isFirstWeekOfMonth) return null;

                                            return (
                                                <span 
                                                    key={weekIndex} 
                                                    className="absolute" 
                                                    style={{ left: `${weekIndex * 16}px` }}
                                                >
                                                    {month}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* Grid (Big Boxes) */}
                                    <div className="flex gap-[4px] min-w-[832px]">
                                        {Array.from({ length: 52 }).map((_, weekIndex) => (
                                            <div key={weekIndex} className="flex flex-col gap-[4px] flex-shrink-0">
                                                {Array.from({ length: 7 }).map((_, dayIndex) => {
                                                    const todayRef = new Date();
                                                    const currentD = todayRef.getDay();
                                                    const daysAgo = (51 - weekIndex) * 7 + (currentD - dayIndex);
                                                    

                                                    if (daysAgo < 0) return <div key={dayIndex} className="w-[12px] h-[12px] opacity-0" />;

                                                    const date = new Date();
                                                    date.setDate(date.getDate() - daysAgo);
                                                    const dateStr = date.toISOString().split('T')[0];
                                                    const count = user.contribution_grid?.[dateStr] || 0;
                                                    

                                                    const color = count === 0 ? '#161b22' : 
                                                                    count < 3 ? '#0e4429' : 
                                                                    count < 6 ? '#006d32' : 
                                                                    count < 10 ? '#26a641' : '#39d353';

                                                    return (
                                                        <div 
                                                            key={dayIndex} 
                                                            className="w-[12px] h-[12px] rounded-[2px] transition-all hover:scale-125 hover:ring-1 hover:ring-white cursor-pointer relative group-activity"
                                                            style={{ backgroundColor: color }}
                                                            title={`${count} contributions on ${date.toDateString()}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t border-[#30363d] pt-4">
                                <div className="text-[10px] text-[#8b949e]">
                                    Each verified paper upload is a contribution. 
                                    <a href="/upload/new" className="font-bold text-[#39d353] hover:text-white transition-all ml-1 p-1 px-2 bg-[#0e4429] rounded-md border border-[#26a641]/30">
                                        Upload a new paper →
                                    </a>
                                </div>
                                <div className="flex items-center gap-1.5 select-none">
                                    <span className="text-[10px] text-[#8b949e]">Less</span>
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-2.5 h-2.5 rounded-[2px]" style={{ 
                                            backgroundColor: i === 0 ? '#161b22' : 
                                                            i === 1 ? '#0e4429' : 
                                                            i === 2 ? '#006d32' : 
                                                            i === 3 ? '#26a641' : '#39d353'
                                        }} />
                                    ))}
                                    <span className="text-[10px] text-[#8b949e]">More</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
