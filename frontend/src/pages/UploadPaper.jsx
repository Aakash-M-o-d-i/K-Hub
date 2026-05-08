import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function UploadPaper() {
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({
        title: '', subject_code: '', department_id: '', semester: '', year: '', professor: '', exam_type: 'End Semester',
    });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/papers/departments').then((res) => setDepartments(res.data.departments)).catch(() => { });
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please select a file to upload');
        if (!agreed) return setError('Please agree to the terms');
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });

        try {
            await api.post('/papers/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : 0;

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/20 mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold">upload_file</span>
                    </div>
                    <h1 className="font-display text-4xl font-black text-text-main tracking-tight leading-tight">
                        Upload Exam Repository
                    </h1>
                    <p className="text-base text-text-muted mt-3 max-w-lg font-medium">
                        Contribute high-quality question papers to the community. Your uploads fuel the academic hub.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 px-6 py-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm font-bold flex items-center gap-3 animate-shake">
                        <span className="material-symbols-outlined text-xl">error_outline</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-[2.5rem] p-16 text-center cursor-pointer transition-all duration-500 group
              ${dragOver
                                ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/10'
                                : file
                                    ? 'border-success/40 bg-success/5 shadow-xl shadow-success/5'
                                    : 'border-border-main bg-bg-surface hover:border-primary/40 hover:bg-primary/5 hover:shadow-2xl hover:shadow-primary/5'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {file ? (
                            <div className="animate-fade-in">
                                <span className="material-symbols-outlined text-6xl text-success mb-4 block scale-110">check_circle</span>
                                <p className="font-black text-text-main text-lg mb-1 truncate max-w-md mx-auto">{file.name}</p>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{fileSizeMB} MB</p>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="mt-6 px-6 py-2 bg-danger/10 text-danger rounded-full text-xs font-black hover:bg-danger hover:text-white transition-all uppercase tracking-widest"
                                >
                                    Remove and Replace
                                </button>
                            </div>
                        ) : (
                            <div className="transition-transform group-hover:scale-105 duration-500">
                                <span className="material-symbols-outlined text-7xl text-text-muted/20 mb-6 block">cloud_upload</span>
                                <p className="font-black text-text-main text-xl mb-2">Drag & Drop Documents</p>
                                <p className="text-sm text-text-muted font-medium mb-8">or <span className="text-primary font-black underline decoration-2 underline-offset-4">browse your library</span></p>
                                <div className="flex items-center justify-center gap-4">
                                    <span className="px-3 py-1 bg-bg-main text-text-muted text-[10px] font-black rounded-lg border border-border-main">ALL TYPES</span>
                                    <span className="px-3 py-1 bg-bg-main text-text-muted text-[10px] font-black rounded-lg border border-border-main">ACADEMIC DOCS</span>
                                    <span className="px-3 py-1 bg-bg-main text-text-muted text-[10px] font-black rounded-lg border border-border-main">ZIP/IMAGES</span>
                                </div>
                            </div>
                        )}

                        {/* Upload progress */}
                        {loading && progress > 0 && (
                            <div className="absolute inset-x-8 bottom-8 animate-fade-in">
                                <div className="w-full h-3 bg-bg-main rounded-full overflow-hidden border border-border-main p-0.5">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-3 px-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Uploading Package...</p>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{progress}%</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Paper details */}
                    <div className="bg-bg-surface rounded-[2.5rem] border border-border-main p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

                        <h2 className="font-black text-text-main text-xl flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-2xl text-primary">edit_note</span>
                            Content Meta-Data
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2.5 ml-1">Academic Subject Name *</label>
                                <input
                                    type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="e.g. Advanced Operating Systems" required
                                    className="w-full px-6 py-4 rounded-2xl border border-border-main bg-bg-main/50 text-text-main font-bold placeholder:font-medium placeholder:text-text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all font-display"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2.5 ml-1">Subject Code *</label>
                                <input
                                    type="text" value={form.subject_code} onChange={(e) => handleChange('subject_code', e.target.value)}
                                    placeholder="e.g. CSE-402" required
                                    className="w-full px-6 py-4 rounded-2xl border border-border-main bg-bg-main/50 text-text-main font-bold placeholder:font-medium placeholder:text-text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2.5 ml-1">Academic Department *</label>
                                <select
                                    value={form.department_id} onChange={(e) => handleChange('department_id', e.target.value)}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-border-main bg-bg-main/50 text-text-main font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Branch</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2.5 ml-1">Current Semester *</label>
                                <select
                                    value={form.semester} onChange={(e) => handleChange('semester', e.target.value)}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-border-main bg-bg-main/50 text-text-main font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Sem</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                        <option key={s} value={s}>Semester {s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2.5 ml-1">Examination Session *</label>
                                <select
                                    value={form.year} onChange={(e) => handleChange('year', e.target.value)}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-border-main bg-bg-main/50 text-text-main font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Session</option>
                                    {(() => {
                                        const years = [];
                                        const currentYear = new Date().getFullYear();
                                        for (let i = 0; i < 5; i++) {
                                            const y = currentYear - i;
                                            years.push(`${y}-${y + 1}`);
                                            years.push(`${y-1}-${y}`);
                                        }
                                        return [...new Set(years)].sort().reverse().slice(0, 8).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ));
                                    })()}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2.5 ml-1">Examination Type *</label>
                                <select
                                    value={form.exam_type} onChange={(e) => handleChange('exam_type', e.target.value)}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-border-main bg-bg-main/50 text-text-main font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Mid 1">Mid Semester 1</option>
                                    <option value="Mid 2">Mid Semester 2</option>
                                    <option value="End Semester">End Semester</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2.5 ml-1">Professor In-Charge <span className="text-[10px] opacity-60 ml-1">(Optional)</span></label>
                                <input
                                    type="text" value={form.professor} onChange={(e) => handleChange('professor', e.target.value)}
                                    placeholder="e.g. Dr. Ravindra Kumar"
                                    className="w-full px-6 py-4 rounded-2xl border border-border-main bg-bg-main/50 text-text-main font-bold placeholder:font-medium placeholder:text-text-muted/40 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="bg-bg-surface/50 border border-border-main rounded-3xl p-6">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center pt-0.5">
                                <input
                                    type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                                    className="peer w-6 h-6 rounded-lg border-2 border-text-muted/30 bg-bg-main/50 text-primary focus:ring-primary/30 transition-all cursor-pointer appearance-none checked:bg-primary checked:border-primary"
                                />
                                <span className="material-symbols-outlined absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white text-base left-1 transition-opacity">check</span>
                            </div>
                            <span className="text-sm text-text-muted font-bold leading-relaxed selection:bg-primary/20">
                                I certify that this file is fully legible, academically relevant, and does not violate any institutional or copyright policies. I understand that misrepresentation may lead to account suspension.
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                        <button
                            type="button" onClick={() => navigate(-1)}
                            className="w-full md:w-auto px-10 py-4 rounded-2xl border border-border-main text-sm font-black text-text-muted hover:bg-bg-surface hover:text-text-main transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading || !agreed}
                            className="w-full flex-1 py-4 bg-primary text-white font-black rounded-2xl text-sm
                hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-2xl shadow-primary/30
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined font-black">upload_file</span>
                            {loading ? 'Processing Protocol...' : 'Confirm and Upload Paper'}
                        </button>
                    </div>
                </form>

                {/* Quick tips */}
                <div className="mt-16 bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10">
                    <h3 className="text-sm font-black text-primary mb-6 flex items-center gap-3 uppercase tracking-tighter">
                        <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                        Submission Guidelines
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="material-symbols-outlined text-3xl text-primary mb-3">visibility</span>
                            <p className="text-[11px] font-bold text-text-main uppercase tracking-widest mb-2">Clarity First</p>
                            <p className="text-xs text-text-muted leading-relaxed font-medium">Ensure all text and diagrams are high-contrast and fully readable.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="material-symbols-outlined text-3xl text-primary mb-3">ads_click</span>
                            <p className="text-[11px] font-bold text-text-main uppercase tracking-widest mb-2">Accuracy</p>
                            <p className="text-xs text-text-muted leading-relaxed font-medium">Double-check the subject codes and examination sessions.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="material-symbols-outlined text-3xl text-primary mb-3">stars</span>
                            <p className="text-[11px] font-bold text-text-main uppercase tracking-widest mb-2">Scholar Points</p>
                            <p className="text-xs text-text-muted leading-relaxed font-medium">Earn +5 for upload and +15 global credits upon verification.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
