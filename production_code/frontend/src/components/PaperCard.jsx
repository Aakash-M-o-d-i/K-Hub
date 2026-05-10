import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PaperCard({ paper, onPreview, onBookmark: externalOnBookmark, isBookmarked: initialIsBookmarked }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [bookmarking, setBookmarking] = useState(false);

    const sizeFormatted = paper.file_size
        ? (paper.file_size / (1024 * 1024)).toFixed(1) + ' MB'
        : '—';

    const handleBookmark = async (e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        if (bookmarking) return;
        setBookmarking(true);
        try {
            const res = await api.post(`/papers/${paper.id}/bookmark`);
            setIsBookmarked(res.data.isBookmarked);
            if (externalOnBookmark) externalOnBookmark(paper, res.data.isBookmarked);
        } catch {
        
        } finally {
            setBookmarking(false);
        }
    };

    const handleCardClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        onPreview?.(paper);
    };

    return (
        <div
            className="group relative bg-bg-surface rounded-[2rem] border border-border-main p-6
        hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer
        flex flex-col h-full overflow-hidden"
            onClick={handleCardClick}
        >
            {/* Glass Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Guest Lock Overlay */}
            {!user && (
                <div className="absolute inset-0 z-20 rounded-[2rem] bg-gradient-to-t from-bg-surface/95 via-transparent to-transparent flex flex-col items-center justify-end pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-black rounded-full shadow-xl shadow-primary/30 pointer-events-auto">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        Sign in to View & Download
                    </div>
                </div>
            )}

            {/* Top row: file badge + bookmark */}
            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bg-main border border-border-main text-text-muted text-[10px] font-bold uppercase tracking-wider w-fit">
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        {paper.file_type || 'PDF'}
                    </div>
                    {/* Status Badge */}
                    {paper.status && paper.status !== 'approved' && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-current w-fit shadow-lg shadow-current/5 animate-fade-in
                            ${paper.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                            <span className="material-symbols-outlined text-[14px]">{paper.status === 'pending' ? 'hourglass_top' : 'error'}</span>
                            {paper.status}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className="w-10 h-10 rounded-full bg-bg-surface border border-border-main flex items-center justify-center 
                   hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all duration-300 shadow-sm
                   disabled:opacity-50"
                >
                    <span
                        className={`material-symbols-outlined text-[22px] ${isBookmarked ? 'text-gold' : 'text-text-muted/30'
                            } transition-transform duration-300 scale-100 active:scale-90`}
                        style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                        bookmark
                    </span>
                </button>
            </div>

            {/* Subject info */}
            <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-[11px] text-primary/40 font-bold uppercase tracking-[0.2em] px-0.5">
                        {paper.subject_code}
                    </p>
                    <span className="px-2 py-0.5 rounded-md bg-primary/5 text-primary/60 text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        {paper.exam_type}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-text-main line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300 mb-4">
                    {paper.title}
                </h3>

                {/* Rejection Reason Text */}
                {paper.status === 'rejected' && (
                    <div className="mb-6 p-4 rounded-2xl bg-danger/5 border border-danger/10 text-[12px] text-danger/80 font-medium leading-relaxed animate-fade-in">
                        <span className="font-black uppercase text-[10px] tracking-widest block mb-1 opacity-60">Moderator Feedback</span>
                        {paper.rejection_reason || 'Inconsistent metadata or illegible content. Please re-upload with correct details.'}
                    </div>
                )}

                {/* Meta grid */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-text-muted font-medium mb-6">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-text-muted/40">calendar_today</span>
                        {paper.year}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-text-muted/40">school</span>
                        Sem {paper.semester}
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                        <span className="material-symbols-outlined text-[18px] text-text-muted/40">data_usage</span>
                        {sizeFormatted}
                    </div>
                </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-5 border-t border-border-main relative z-10 mt-auto">
                <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <span className="text-sm font-bold text-text-main">{paper.rating_avg?.toFixed(1) || '—'}</span>
                    <span className="text-[11px] text-text-muted/50">({paper.rating_count || 0})</span>
                </div>

                <div className="flex items-center gap-1.5 text-text-muted bg-bg-main/50 px-3 py-1.5 rounded-xl border border-border-main">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span className="text-[12px] font-bold text-text-muted">{paper.download_count || 0}</span>
                </div>
            </div>
        </div>
    );
}
