import { useState } from 'react';
import api from '../api/axios';

export default function PaperPreview({ paper, onClose }) {
    const [downloading, setDownloading] = useState(false);

    if (!paper) return null;

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await api.get(`/papers/${paper.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${paper.subject_code}_${paper.year}.${paper.file_type || 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Download failed. Please log in first.');
        } finally {
            setDownloading(false);
        }
    };

    const dateFormatted = paper.created_at
        ? new Date(paper.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
        })
        : '—';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-bg-surface rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up flex flex-col lg:flex-row border border-border-main">
                {/* Left: File preview */}
                <div className="lg:w-3/5 bg-bg-main flex items-center justify-center min-h-[300px] lg:min-h-0 relative overflow-hidden">
                    {paper.file_type === 'pdf' ? (
                        <iframe
                            src={`${api.defaults.baseURL}/papers/${paper.id}/preview`}
                            title={`Preview of ${paper.title}`}
                            className="w-full h-full min-h-[400px] lg:min-h-[600px] border-0"
                        />
                    ) : ['jpg', 'jpeg', 'png'].includes(paper.file_type) ? (
                        <img
                            src={`${api.defaults.baseURL}/papers/${paper.id}/preview`}
                            alt={paper.title}
                            className="max-w-full max-h-full object-contain p-4"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <span className="material-symbols-outlined text-6xl text-text-muted/20 mb-4 block">description</span>
                            <p className="text-text-muted text-sm">Preview not available for .{paper.file_type} files</p>
                            <p className="text-xs text-text-muted/60 mt-1">Download to view this file</p>
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="lg:w-2/5 bg-primary text-white p-8 overflow-y-auto custom-scrollbar flex flex-col relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>

                    <div className="relative z-0">
                        <h2 className="font-display text-xl font-bold mb-1 leading-tight">{paper.title}</h2>
                        <p className="text-white/80 text-sm font-medium mb-6 uppercase tracking-wider">{paper.subject_code}</p>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Branch</p>
                                <p className="font-semibold text-sm truncate">{paper.department?.name || '—'}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Semester</p>
                                <p className="font-semibold text-sm">Sem {paper.semester}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Academic Year</p>
                                <p className="font-semibold text-sm">{paper.year}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Date Added</p>
                                <p className="font-semibold text-sm">{dateFormatted}</p>
                            </div>
                        </div>

                        {/* Contributor */}
                        {paper.uploader && (
                            <div className="flex items-center gap-3 mb-6 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/5">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                                    {paper.uploader.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{paper.uploader.name}</p>
                                    <p className="text-[10px] text-white/60 uppercase tracking-widest leading-none">Verified Contributor</p>
                                </div>
                            </div>
                        )}

                        {/* Professor */}
                        {paper.professor && (
                            <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/5">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Professor In-charge</p>
                                <p className="text-sm font-semibold">{paper.professor}</p>
                            </div>
                        )}

                        {/* Rejection Feedback */}
                        {paper.status === 'rejected' && (
                            <div className="mb-6 p-4 rounded-2xl bg-white/10 border border-white/5 shadow-inner animate-fade-in">
                                <span className="font-black uppercase text-[10px] tracking-widest block mb-2 text-white/60">Moderator Feedback</span>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed italic">
                                        "{paper.rejection_reason || 'Inconsistent metadata or illegible content. Please re-upload with correct details.'}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {paper.department?.code || 'GEN'}
                            </span>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Sem {paper.semester}
                            </span>
                            <span className="px-3 py-1 bg-white/30 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                {paper.exam_type}
                            </span>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-center px-4">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Rating</p>
                                <div className="flex items-center gap-1.5 justify-center">
                                    <span className="material-symbols-outlined text-[18px] text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="font-bold text-lg">{paper.rating_avg || '0'}</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center px-4">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Downloads</p>
                                <div className="flex items-center gap-1.5 justify-center">
                                    <span className="material-symbols-outlined text-[18px] text-emerald-300">download</span>
                                    <span className="font-bold text-lg">{paper.download_count}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full py-4 bg-white text-primary font-black rounded-2xl text-sm
                    hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-black/10"
                            >
                                <span className="material-symbols-outlined font-bold">download</span>
                                {downloading ? 'Preparing File...' : 'Download This Paper'}
                            </button>
                            <button className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl text-sm
                  hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">flag</span>
                                Report Content
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
