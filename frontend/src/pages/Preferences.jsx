import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Preferences() {
    const { user, refreshUser } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [prefs, setPrefs] = useState({
        interface_mode: 'system',
        accent_color: 'blue',
        paper_alerts: true,
        leaderboard_updates: true,
        system_announcements: false,
        default_department_id: '',
        download_behavior: 'direct'
    });

    useEffect(() => {
        if (user && user.preferences) {
            setPrefs({
                ...user.preferences,
                default_department_id: user.preferences.default_department_id || ''
            });
        }
    }, [user]);

    useEffect(() => {
        api.get('/papers/departments')
            .then(res => setDepartments(res.data.departments))
            .catch(err => console.error('Failed to fetch departments:', err));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/auth/preferences', prefs);
            await refreshUser();
            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        } catch (err) {
            console.error('Failed to save preferences:', err);
            setMessage({ type: 'error', text: 'Failed to save preferences' });
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (user && user.preferences) {
            setPrefs({
                ...user.preferences,
                default_department_id: user.preferences.default_department_id || ''
            });
        }
        setMessage({ type: '', text: '' });
    };

    const accentColors = [
        { name: 'blue', class: 'bg-blue-600' },
        { name: 'emerald', class: 'bg-emerald-500' },
        { name: 'amber', class: 'bg-amber-500' },
        { name: 'rose', class: 'bg-rose-500' },
        { name: 'indigo', class: 'bg-indigo-600' },
        { name: 'slate', class: 'bg-slate-600' }
    ];

    if (!user) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main text-text-main">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="font-display text-4xl font-bold mb-2">Workspace Preferences</h1>
                    <p className="text-text-muted">Personalize your academic repository experience for maximum efficiency.</p>
                </header>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-2xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Appearance */}
                    <section className="bg-bg-surface rounded-[2rem] p-8 border border-border-main">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary">palette</span>
                            <h2 className="text-lg font-bold">Appearance</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 block">Interface Mode</label>
                                <div className="grid grid-cols-3 gap-2 p-1 bg-bg-main rounded-2xl border border-border-main">
                                    {['light', 'dark', 'system'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setPrefs({ ...prefs, interface_mode: mode })}
                                            className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${prefs.interface_mode === mode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {mode === 'light' ? 'light_mode' : mode === 'dark' ? 'dark_mode' : 'settings_brightness'}
                                                </span>
                                                {mode}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 block">Accent Color</label>
                                <div className="flex flex-wrap gap-4">
                                    {accentColors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setPrefs({ ...prefs, accent_color: color.name })}
                                            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${color.class} ${prefs.accent_color === color.name ? 'ring-4 ring-text-main ring-offset-4 ring-offset-bg-surface scale-110' : 'hover:scale-110'
                                                }`}
                                        >
                                            {prefs.accent_color === color.name && <span className="material-symbols-outlined text-white text-[20px] font-bold">check</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="bg-bg-surface rounded-[2rem] p-8 border border-border-main">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-purple-400">notifications</span>
                            <h2 className="text-lg font-bold">Notifications</h2>
                        </div>

                        <div className="space-y-6">
                            {[
                                { id: 'paper_alerts', label: 'Paper Alerts', desc: 'Get notified when new papers are uploaded for your department.', icon: 'description' },
                                { id: 'leaderboard_updates', label: 'Leaderboard Updates', desc: 'Monthly digests on top contributors and your ranking.', icon: 'leaderboard' },
                                { id: 'system_announcements', label: 'System Announcements', desc: 'Critical maintenance and feature release notes.', icon: 'campaign' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between group">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-bg-main flex items-center justify-center text-text-muted/40 group-hover:text-text-main transition-all">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{item.label}</p>
                                            <p className="text-xs text-text-muted">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPrefs({ ...prefs, [item.id]: !prefs[item.id] })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${prefs[item.id] ? 'bg-primary' : 'bg-text-muted/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs[item.id] ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Content Settings */}
                    <section className="bg-bg-surface rounded-[2rem] p-8 border border-border-main">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-emerald-400">settings_suggest</span>
                            <h2 className="text-lg font-bold">Content Settings</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 block">Default Department</label>
                                <div className="relative group">
                                    <select
                                        value={prefs.default_department_id}
                                        onChange={(e) => setPrefs({ ...prefs, default_department_id: e.target.value })}
                                        className="w-full pl-5 pr-12 py-3.5 bg-bg-main border border-border-main rounded-2xl text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 appearance-none transition-all"
                                    >
                                        <option value="">Current Profile Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 block">Download Behavior</label>
                                <div className="space-y-3">
                                    {[
                                        { id: 'direct', label: 'Direct Download (PDF)', icon: 'file_download' },
                                        { id: 'viewer', label: 'Open in Web Viewer', icon: 'visibility' },
                                        { id: 'always_ask', label: 'Always Ask', icon: 'help' }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setPrefs({ ...prefs, download_behavior: option.id })}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${prefs.download_behavior === option.id ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-bg-main border-border-main text-text-muted hover:bg-bg-surface hover:text-text-main'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined">{option.icon}</span>
                                                <span className="text-sm font-bold">{option.label}</span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${prefs.download_behavior === option.id ? 'border-primary' : 'border-text-muted/20'
                                                }`}>
                                                {prefs.download_behavior === option.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-12 flex items-center justify-end gap-6">
                    <button
                        onClick={handleDiscard}
                        className="text-text-muted hover:text-text-main text-sm font-bold transition-all"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-10 py-4 bg-primary text-white rounded-2xl text-sm font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
}
