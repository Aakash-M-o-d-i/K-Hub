import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoApproval, setAutoApproval] = useState(true);
    const [modAssignment, setModAssignment] = useState('round-robin');
    const [spamSensitivity, setSpamSensitivity] = useState('Medium');
    const [maxFileSize, setMaxFileSize] = useState(50);
    const [extensions, setExtensions] = useState(['.pdf', '.docx', '.jpg', '.png']);
    const [newExt, setNewExt] = useState('');
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/nituganesh/settings');
            const data = res.data;
            if (data.auto_approval !== undefined) setAutoApproval(data.auto_approval);
            if (data.mod_assignment) setModAssignment(data.mod_assignment);
            if (data.spam_sensitivity) setSpamSensitivity(data.spam_sensitivity);
            if (data.max_file_size) setMaxFileSize(data.max_file_size);
            if (data.allowed_extensions) setExtensions(data.allowed_extensions);
        } catch {
        
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            await api.post('/nituganesh/settings', {
                auto_approval: autoApproval,
                mod_assignment: modAssignment,
                spam_sensitivity: spamSensitivity,
                max_file_size: Number(maxFileSize),
                allowed_extensions: extensions
            });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch {
        
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddExt = (e) => {
        if (e.key === 'Enter' && newExt.trim()) {
            const ext = newExt.trim().toLowerCase();
            const formattedExt = ext.startsWith('.') ? ext : `.${ext}`;
            if (!extensions.includes(formattedExt)) {
                setExtensions([...extensions, formattedExt]);
            }
            setNewExt('');
        }
    };

    const handleRemoveExt = (ext) => {
        setExtensions(extensions.filter(e => e !== ext));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg shadow-primary/10" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] animate-pulse">Initializing Security Protocols</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
                    <div>
                        <h1 className="text-2xl font-black text-text-main tracking-tight">Security & Moderated</h1>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">System Configuration & Logic</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mr-2 animate-pulse" />
                        Node Status: Optimal
                    </span>
                </div>
            </div>

            {/* Navigation Tabs Mockup */}
            <div className="flex items-center gap-8 border-b border-border-main scrollbar-none overflow-x-auto">
                <button className="pb-4 text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-[0.2em] whitespace-nowrap">Audit Trail</button>
                <button className="pb-4 text-[10px] font-black text-primary border-b-2 border-primary uppercase tracking-[0.2em] whitespace-nowrap">Configuration</button>
                <button className="pb-4 text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-[0.2em] whitespace-nowrap">Encryption Keys</button>
            </div>

            <div className="space-y-6">
                {/* Content Workflow Section */}
                <section className="bg-bg-surface rounded-[2rem] shadow-xl border border-border-main overflow-hidden">
                    <div className="p-8 border-b border-border-main bg-bg-main/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-xl">rule</span>
                            </div>
                            <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Content Workflow</h2>
                        </div>
                    </div>
                    <div className="p-8 space-y-10">
                        {/* Auto-Approval Toggle */}
                        <div className="flex items-center justify-between gap-8 group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-[13px] font-black text-text-main tracking-tight group-hover:text-primary transition-colors uppercase">Auto-Approval Logic</h3>
                                    <div className="relative group/tooltip inline-block">
                                        <span className="material-symbols-outlined text-text-muted text-sm cursor-help hover:text-primary transition-colors">info</span>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-4 bg-bg-surface text-text-muted text-[10px] font-bold rounded-2xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 text-center pointer-events-none border border-border-main uppercase tracking-tight">
                                            Skips the manual review queue for verified contributors. Optimal for trusted networks.
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-border-main"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[11px] text-text-muted font-medium leading-relaxed max-w-lg">When enabled, uploads from 'Trusted' users will bypass the moderation queue and be published immediately to the global repository.</p>
                            </div>
                            <button
                                onClick={() => setAutoApproval(!autoApproval)}
                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary/10 ${autoApproval ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-bg-main border-border-main'}`}
                            >
                                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ${autoApproval ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="h-px bg-border-main" />

                        {/* Spam & Assignment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Default Protocol Assignment</label>
                                <div className="relative group">
                                    <select
                                        value={modAssignment}
                                        onChange={(e) => setModAssignment(e.target.value)}
                                        className="w-full bg-bg-main border border-border-main text-text-main text-[11px] font-black uppercase tracking-widest rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary cursor-pointer transition-all appearance-none shadow-sm"
                                    >
                                        <option value="round-robin">Round Robin (Optimal)</option>
                                        <option value="manual">Manual Overhead</option>
                                        <option value="seniority">Seniority Protocol</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted transition-colors group-hover:text-primary">
                                        <span className="material-symbols-outlined text-xl">expand_more</span>
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Spam Shield Sensitivity</label>
                                <div className="flex bg-bg-main rounded-2xl p-1.5 border border-border-main shadow-inner">
                                    {['Low', 'Medium', 'High'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setSpamSensitivity(level)}
                                            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${spamSensitivity === level ? 'bg-bg-surface text-primary shadow-xl border border-border-main scale-[1.02]' : 'text-text-muted hover:text-primary'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Constraints Section */}
                <section className="bg-bg-surface rounded-[2rem] shadow-xl border border-border-main overflow-hidden">
                    <div className="p-8 border-b border-border-main bg-bg-main/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-xl">cloud_upload</span>
                            </div>
                            <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Technical Constraints</h2>
                        </div>
                    </div>
                    <div className="p-8 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* File Size */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Ingestion Payload Limit</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={maxFileSize}
                                        onChange={(e) => setMaxFileSize(e.target.value)}
                                        className="w-full bg-bg-main border border-border-main rounded-2xl pl-5 pr-14 py-4 text-[13px] font-black text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                        placeholder="50"
                                    />
                                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                        <span className="text-[10px] font-black text-text-muted tracking-widest opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">MEGABYTES</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-text-muted font-bold tracking-tight opacity-50 uppercase">Hard node limit is calibrated to 128MB</p>
                            </div>

                            {/* File Extensions */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Authorized Extensions</label>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={newExt}
                                            onChange={(e) => setNewExt(e.target.value)}
                                            onKeyDown={handleAddExt}
                                            className="w-full bg-bg-main border border-border-main rounded-2xl px-5 py-4 text-[11px] font-black text-text-main placeholder:text-text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                            placeholder="APPEND PROTOCOL (E.G. .PDF)"
                                        />
                                        <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">
                                            <span className="material-symbols-outlined text-lg">add_circle</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {extensions.map(ext => (
                                            <span key={ext} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black bg-primary/5 text-primary border border-primary/20 transition-all hover:bg-primary/10 hover:shadow-md uppercase tracking-widest group/tag">
                                                {ext}
                                                <button
                                                    onClick={() => handleRemoveExt(ext)}
                                                    className="text-text-muted hover:text-danger hover:scale-125 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[13px] font-bold">close</span>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Save Changes Footer */}
                <div className="sticky bottom-8 z-10 bg-bg-surface/90 backdrop-blur-xl border border-border-main rounded-[2rem] p-4 flex items-center justify-between shadow-2xl shadow-primary/10 ring-1 ring-border-main/50">
                    <div className="px-6 flex items-center gap-4">
                        {saveStatus === 'success' ? (
                            <span className="flex items-center gap-2.5 text-success text-[10px] font-black uppercase tracking-[0.2em] animate-in zoom-in-95 duration-300">
                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                Settings Synchronized
                            </span>
                        ) : saveStatus === 'error' ? (
                            <span className="flex items-center gap-2.5 text-danger text-[10px] font-black uppercase tracking-[0.2em] animate-in shake duration-300">
                                <span className="material-symbols-outlined text-xl">error</span>
                                Update Interrupted
                            </span>
                        ) : (
                            <div className="flex items-center gap-3">
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-text-muted opacity-40">cloud_done</span>
                                )}
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60">
                                    {saving ? 'Syncing with secure node...' : 'Local stack ready for deployment'}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 text-[11px] uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                        {saving ? 'Processing...' : 'Deploy Configuration'}
                        {!saving && <span className="material-symbols-outlined text-lg tracking-normal">bolt</span>}
                    </button>
                </div>

                {/* Danger Zone Section */}
                <section className="bg-danger/5 border border-danger/20 rounded-[2rem] overflow-hidden mt-12 transition-all hover:bg-danger/10">
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-10 w-10 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
                                <span className="material-symbols-outlined text-xl">warning</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-danger uppercase tracking-widest">Termination Zone</h2>
                                <p className="text-[10px] text-danger/60 font-black uppercase tracking-widest mt-0.5">High Impact Operations</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-danger/80 mb-10 max-w-2xl font-medium leading-relaxed italic border-l-2 border-danger/20 pl-4">
                            These actions are structurally destructive and may cause permanent telemetry loss. Ensure multiple system backups are validated before execution.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Clear Cache */}
                            <div className="bg-bg-surface border border-border-main p-6 rounded-2xl flex items-center justify-between group hover:border-danger/30 transition-all shadow-sm">
                                <div>
                                    <h3 className="text-[12px] font-black text-text-main uppercase tracking-tight">Flush System Cache</h3>
                                    <p className="text-[10px] text-text-muted mt-1 font-bold italic opacity-60 uppercase">Volatile memory purge</p>
                                </div>
                                <button className="px-6 py-3 border border-border-main hover:bg-danger/10 hover:border-danger/40 hover:text-danger text-text-muted text-[10px] font-black rounded-xl transition-all active:scale-95 uppercase tracking-widest whitespace-nowrap ml-4">
                                    Execute Purge
                                </button>
                            </div>

                            {/* Reset Database */}
                            <div className="bg-bg-surface border border-border-main p-6 rounded-2xl flex items-center justify-between group hover:border-danger/30 transition-all shadow-sm">
                                <div>
                                    <h3 className="text-[12px] font-black text-text-main uppercase tracking-tight">Protocol Reset</h3>
                                    <p className="text-[10px] text-danger mt-1 font-black opacity-60 uppercase tracking-tighter">Factory Calibration</p>
                                </div>
                                <button className="px-6 py-3 bg-danger hover:bg-danger/90 text-white text-[10px] font-black rounded-xl transition-all shadow-xl shadow-danger/20 active:scale-95 uppercase tracking-widest whitespace-nowrap ml-4">
                                    Factory Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center opacity-40">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                    Knowledge Hub Core Node
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    v3.2.0 Stable
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    Secure Admin Panel
                </p>
            </div>
        </div>
    );
}
