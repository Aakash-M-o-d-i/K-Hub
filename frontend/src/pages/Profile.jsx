import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roll_no: '',
        department_id: '',
        year: '',
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
                bio: user.bio || ''
            });
        }
    }, [user]);

    useEffect(() => {
        api.get('/papers/departments')
            .then(res => setDepartments(res.data.departments))
            .catch(err => console.error('Failed to fetch departments:', err));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/auth/me', formData);
            await refreshUser();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            console.error('Failed to update profile:', err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main scrollbar-thin scrollbar-thumb-border-main scrollbar-track-transparent">
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
                                            {user.department?.name || 'Department Neutral'}, Year {user.year || '3'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-5 py-2 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20 flex items-center gap-2 shadow-sm">
                                            <span className="material-symbols-outlined text-base">verified</span> Top Contributor
                                        </span>
                                        <span className="px-5 py-2 bg-warning/10 text-warning text-[9px] font-black uppercase tracking-widest rounded-full border border-warning/20 flex items-center gap-2 shadow-sm">
                                            <span className="material-symbols-outlined text-base">auto_awesome</span> Beta Tester
                                        </span>
                                        <span className="px-5 py-2 bg-success/10 text-success text-[9px] font-black uppercase tracking-widest rounded-full border border-success/20 flex items-center gap-2 shadow-sm">
                                            <span className="material-symbols-outlined text-base">library_books</span> 50+ Papers
                                        </span>
                                    </div>
                                </div>

                                {/* Shared Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                    {[
                                        { label: 'Total Uploads', value: user.total_uploads || 42, trend: '+5', color: 'primary' },
                                        { label: 'Current Rank', value: `#${user.rank || '5'}`, trend: 'Top 1%', color: 'success' },
                                        { label: 'Reputation', value: user.total_points?.toLocaleString() || '1,240', color: 'warning' },
                                        { label: 'Downloads', value: user.total_downloads || 856, color: 'primary' }
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
                    {/* Personal Information (Left) */}
                    <div className="lg:col-span-8">
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

                    {/* Contribution Summary (Right) */}
                    <div className="lg:col-span-4">
                        <div className="bg-bg-surface p-8 rounded-3xl border border-border-main shadow-sm h-full flex flex-col">
                            <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-1">Contribution Summary</h3>
                            <p className="text-[11px] text-text-muted font-bold opacity-60 mb-10">Upload activity over the last 6 months.</p>

                            <div className="flex-1 flex items-end justify-between gap-3 h-48 border-b border-border-main/30 pb-4 mb-8">
                                {[30, 45, 25, 60, 80, 55].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar relative">
                                        <div className="w-full bg-slate-100 dark:bg-bg-main/50 rounded-lg relative overflow-hidden h-full">
                                            <div
                                                className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${i === 5 ? 'bg-slate-900 dark:bg-primary h-11' : 'bg-slate-200 dark:bg-primary/20'}`}
                                                style={{ height: i === 5 ? '11px' : `${h}%` }}
                                            />
                                            {i === 5 && (
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-bg-main text-white dark:text-text-main px-1.5 py-0.5 rounded text-[8px] font-bold">11</div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${i === 5 ? 'text-slate-900 dark:text-primary' : 'text-text-muted opacity-40'}`}>
                                            {'JanFebMarAprMayJun'.slice(i * 3, (i + 1) * 3)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-text-muted opacity-60">Total this month</span>
                                    <span className="text-text-main">11 Papers</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-bg-main rounded-full h-2.5 overflow-hidden">
                                    <div className="h-full bg-success rounded-full" style={{ width: '73%' }} />
                                </div>
                                <div className="pt-2 text-[10px] text-success font-black uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    You are in the top 5% of uploaders!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
