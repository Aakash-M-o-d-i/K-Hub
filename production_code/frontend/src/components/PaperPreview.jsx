import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import MobilePdfViewer from './MobilePdfViewer';

/** Detect mobile: narrow viewport OR touch-primary device */
function useIsMobile() {
    const [mobile, setMobile] = useState(() =>
        window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches
    );
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1023px), (pointer: coarse)');
        const handler = (e) => setMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return mobile;
}

export default function PaperPreview({ paper, onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [downloading, setDownloading] = useState(false);
    const [myScore, setMyScore] = useState(null);
    const [ratingAvg, setRatingAvg] = useState(paper?.rating_avg || 0);
    const [ratingCount, setRatingCount] = useState(paper?.rating_count || 0);
    const [loadingRating, setLoadingRating] = useState(false);
    const [showDetails, setShowDetails] = useState(true);

    const isLoggedIn = !!user;

    useEffect(() => {
        if (!paper || !isLoggedIn) return;
        setLoadingRating(true);
        api.get(`/papers/${paper.id}/rating`)
            .then((res) => setMyScore(res.data.score))
            .catch(() => { })
            .finally(() => setLoadingRating(false));
    }, [paper?.id]);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!paper) return null;

    const handleDownload = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
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
        } catch {
        
        } finally {
            setDownloading(false);
        }
    };

    const handleRate = async (score) => {
        try {
            const res = await api.post(`/papers/${paper.id}/rate`, { score });
            setMyScore(score);
            setRatingAvg(res.data.rating_avg);
            setRatingCount(res.data.rating_count);

            paper.rating_avg = res.data.rating_avg;
            paper.rating_count = res.data.rating_count;
        } catch {
        
        }
    };

    const dateFormatted = paper.created_at
        ? new Date(paper.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
        })
        : '—';

    const previewUrl = `${api.defaults.baseURL}/papers/${paper.id}/preview`;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 lg:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal — responsive: stacks vertically on mobile, side-by-side on desktop */}
            <div className="relative bg-bg-surface rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] lg:max-h-[90vh] overflow-hidden animate-fade-in-up flex flex-col lg:flex-row border border-border-main"
                style={{ height: '95vh' }}
            >
                {/* ─── LEFT: File Preview ─────────────────────────────── */}
                <div className={`bg-bg-main flex items-center justify-center relative overflow-hidden transition-all duration-300
                    min-h-[40vh] lg:min-h-0
                    ${showDetails ? 'flex-1 lg:flex-[2]' : 'flex-1'}
                `}>
                    {isLoggedIn ? (
                        paper.file_type === 'pdf' ? (
                            isMobile ? (
                                <MobilePdfViewer url={previewUrl} title={paper.title} />
                            ) : (
                                <iframe
                                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                    title={`Preview of ${paper.title}`}
                                    className="w-full h-full border-0"
                                    referrerPolicy="no-referrer"
                                />
                            )
                        ) : ['jpg', 'jpeg', 'png'].includes(paper.file_type) ? (
                            <img
                                src={previewUrl}
                                alt={paper.title}
                                className="max-w-full max-h-full object-contain p-4"
                            />
                        ) : (
                            <div className="text-center p-8">
                                <span className="material-symbols-outlined text-6xl text-text-muted/20 mb-4 block">description</span>
                                <p className="text-text-muted text-sm">Preview not available for .{paper.file_type} files</p>
                                <p className="text-xs text-text-muted/60 mt-1">Download to view this file</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 lg:p-10 w-full h-full">
                            <div className="relative mb-6 lg:mb-8">
                                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-xl shadow-primary/10">
                                    <span className="material-symbols-outlined text-4xl lg:text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                </div>
                                <div className="absolute -top-2 -right-2 w-7 h-7 lg:w-8 lg:h-8 bg-gold rounded-full flex items-center justify-center shadow-lg shadow-gold/30 animate-bounce">
                                    <span className="material-symbols-outlined text-xs lg:text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </div>
                            </div>
                            <h3 className="text-lg lg:text-xl font-black text-text-main mb-2">Preview Restricted</h3>
                            <p className="text-xs lg:text-sm text-text-muted max-w-xs mb-6 lg:mb-8 leading-relaxed">
                                Sign in to preview, download, and rate academic papers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                                <Link to="/login" className="flex-1 py-3 bg-primary text-white font-black rounded-xl text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                                    <span className="material-symbols-outlined text-lg">login</span>
                                    Sign In
                                </Link>
                                <Link to="/register" className="flex-1 py-3 bg-bg-surface text-text-main font-black rounded-xl text-sm border border-border-main hover:scale-[1.02] active:scale-[0.98] hover:border-primary/30 transition-all duration-200 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    Register
                                </Link>
                            </div>
                            <p className="text-[10px] text-text-muted/40 mt-5 uppercase tracking-widest font-bold">
                                Free • Instant Access • No Spam
                            </p>
                        </div>
                    )}

                    {/* Toggle details button — visible on all sizes */}
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-bg-surface/90 backdrop-blur-md border border-border-main shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                        title={showDetails ? 'Hide details' : 'Show details'}
                    >
                        <span className="material-symbols-outlined text-text-main text-base lg:text-lg">
                            {showDetails ? 'chevron_right' : 'info'}
                        </span>
                    </button>
                </div>

                {/* ─── RIGHT: Details Panel ────────────────────────────── */}
                {showDetails && (
                    <div className="lg:w-[380px] shrink-0 bg-primary text-white p-5 lg:p-6 overflow-y-auto custom-scrollbar flex flex-col relative
                        max-h-[45vh] lg:max-h-none border-t lg:border-t-0 lg:border-l border-white/10">
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 lg:top-4 lg:right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>

                        <div className="relative z-0">
                            <h2 className="font-display text-lg lg:text-xl font-bold mb-1 leading-tight pr-10">{paper.title}</h2>
                            <p className="text-white/80 text-xs lg:text-sm font-medium mb-4 lg:mb-6 uppercase tracking-wider">{paper.subject_code}</p>

                            {/* Metadata grid */}
                            <div className="grid grid-cols-2 gap-2.5 lg:gap-3 mb-4 lg:mb-5">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 lg:p-3 border border-white/5">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Branch</p>
                                    <p className="font-semibold text-xs lg:text-sm truncate">{paper.department?.name || '—'}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 lg:p-3 border border-white/5">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Semester</p>
                                    <p className="font-semibold text-xs lg:text-sm">Sem {paper.semester}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 lg:p-3 border border-white/5">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Academic Year</p>
                                    <p className="font-semibold text-xs lg:text-sm">{paper.year}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 lg:p-3 border border-white/5">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Date Added</p>
                                    <p className="font-semibold text-xs lg:text-sm">{dateFormatted}</p>
                                </div>
                            </div>

                            {/* Contributor */}
                            {paper.uploader && (
                                <div className="flex items-center gap-3 mb-4 lg:mb-5 p-2.5 lg:p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/5">
                                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {paper.uploader.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs lg:text-sm font-bold truncate">{paper.uploader.name}</p>
                                        <p className="text-[10px] text-white/60 uppercase tracking-widest leading-none">Verified Contributor</p>
                                    </div>
                                </div>
                            )}

                            {/* Professor */}
                            {paper.professor && (
                                <div className="mb-4 lg:mb-5 p-2.5 lg:p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/5">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Professor In-charge</p>
                                    <p className="text-xs lg:text-sm font-semibold">{paper.professor}</p>
                                </div>
                            )}

                            {/* Rejection Feedback */}
                            {paper.status === 'rejected' && (
                                <div className="mb-4 lg:mb-5 p-3 rounded-2xl bg-white/10 border border-white/5 shadow-inner animate-fade-in">
                                    <span className="font-black uppercase text-[10px] tracking-widest block mb-2 text-white/60">Moderator Feedback</span>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-sm">info</span>
                                        </div>
                                        <p className="text-xs lg:text-sm font-medium leading-relaxed italic">
                                            "{paper.rejection_reason || 'Inconsistent metadata or illegible content. Please re-upload with correct details.'}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 lg:gap-2 mb-4 lg:mb-6">
                                <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    {paper.department?.code || 'GEN'}
                                </span>
                                <span className="px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    Sem {paper.semester}
                                </span>
                                <span className="px-2.5 py-1 bg-white/30 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    {paper.exam_type}
                                </span>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-center px-3 lg:px-4">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Rating</p>
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <span className="material-symbols-outlined text-[16px] lg:text-[18px] text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="font-bold text-base lg:text-lg">{ratingAvg || '0'}</span>
                                        <span className="text-white/40 text-xs">({ratingCount})</span>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center px-3 lg:px-4">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Downloads</p>
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <span className="material-symbols-outlined text-[16px] lg:text-[18px] text-emerald-300">download</span>
                                        <span className="font-bold text-base lg:text-lg">{paper.download_count}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Rating */}
                            {paper.status === 'approved' && (
                                <div className="mb-4 lg:mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 lg:mb-3">
                                        {isLoggedIn ? 'Rate this paper' : 'Log in to rate'}
                                    </p>
                                    {isLoggedIn ? (
                                        <div className="flex items-center gap-3">
                                            <StarRating
                                                currentScore={myScore}
                                                onRate={handleRate}
                                                disabled={loadingRating}
                                            />
                                            {myScore && (
                                                <span className="text-xs text-white/50">
                                                    Your rating: {myScore}/5
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-white/40 text-xs">
                                            Sign in to rate and review papers
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2.5 lg:space-y-3">
                                {isLoggedIn ? (
                                    <>
                                        <button
                                            onClick={handleDownload}
                                            disabled={downloading}
                                            className="w-full py-3 lg:py-3.5 bg-white text-primary font-black rounded-2xl text-sm
                                                hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-black/10"
                                        >
                                            <span className="material-symbols-outlined font-bold">download</span>
                                            {downloading ? 'Preparing File...' : 'Download This Paper'}
                                        </button>
                                        <button className="w-full py-3 lg:py-3.5 bg-white/10 text-white font-bold rounded-2xl text-sm
                                            hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined">flag</span>
                                            Report Content
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="w-full py-3 lg:py-3.5 bg-white text-primary font-black rounded-2xl text-sm
                                                hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                                        >
                                            <span className="material-symbols-outlined font-bold">login</span>
                                            Sign In to Download
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="w-full py-3 lg:py-3.5 bg-white/10 text-white font-bold rounded-2xl text-sm
                                                hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">person_add</span>
                                            Create Free Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
