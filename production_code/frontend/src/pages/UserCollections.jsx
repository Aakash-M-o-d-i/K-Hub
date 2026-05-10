import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import PaperCard from '../components/PaperCard';
import PaperPreview from '../components/PaperPreview';

export default function UserCollections() {
    const location = useLocation();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewPaper, setPreviewPaper] = useState(null);
    const [bookmarkIds, setBookmarkIds] = useState(new Set());

    const getCollectionInfo = () => {
        switch (location.pathname) {
            case '/downloads':
                return { title: 'My Downloads', icon: 'download', endpoint: '/papers/me/downloads', empty: 'You haven\'t downloaded any papers yet.' };
            case '/upload':
            case '/uploads':
                return { title: 'My Uploads', icon: 'upload_file', endpoint: '/papers/me/uploads', empty: 'You haven\'t uploaded any papers yet.' };
            case '/bookmarks':
                return { title: 'Bookmarks', icon: 'bookmark', endpoint: '/papers/me/bookmarks', empty: 'No bookmarks yet. Save papers for later!' };
            default:
                return { title: 'Collection', icon: 'folder', endpoint: '/papers/me/downloads', empty: 'Empty collection.' };
        }
    };

    const info = getCollectionInfo();

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [papersRes, bookmarksRes] = await Promise.all([
                    api.get(info.endpoint),
                    api.get('/papers/me/bookmarks')
                ]);
                

                const uniquePapers = Array.from(
                    new Map((papersRes.data.papers || []).map(p => [p.id, p])).values()
                );
                
                setPapers(uniquePapers);
                setBookmarkIds(new Set(bookmarksRes.data.papers.map(p => p.id)));
            } catch {
            
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [info.endpoint]);

    const handleBookmarkToggle = (paper, isBookmarked) => {
        setBookmarkIds(prev => {
            const next = new Set(prev);
            if (isBookmarked) next.add(paper.id);
            else next.delete(paper.id);
            return next;
        });


        if (location.pathname === '/bookmarks' && !isBookmarked) {
            setPapers(prev => prev.filter(p => p.id !== paper.id));
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <span className="material-symbols-outlined text-3xl font-bold">{info.icon}</span>
                    </div>
                    <div>
                        <h1 className="font-display text-4xl font-black text-text-main tracking-tight leading-none">{info.title}</h1>
                        <p className="text-sm text-text-muted mt-2 font-medium">Manage your personal repository and academic history.</p>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-border-main via-border-main/50 to-transparent mb-12" />

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-bg-surface rounded-3xl border border-border-main p-8 animate-pulse">
                                <div className="h-6 w-24 bg-text-muted/10 rounded-lg mb-6" />
                                <div className="h-4 w-3/4 bg-text-muted/5 rounded mb-4" />
                                <div className="h-28 w-full bg-text-muted/5 rounded-2xl mb-6" />
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-20 bg-text-muted/10 rounded" />
                                    <div className="h-10 w-10 bg-text-muted/10 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : papers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-bg-surface border border-border-main rounded-[3rem] shadow-sm">
                        <div className="w-24 h-24 rounded-full bg-bg-main flex items-center justify-center mb-8 border border-border-main">
                            <span className="material-symbols-outlined text-5xl text-text-muted/30">{info.icon}</span>
                        </div>
                        <h3 className="text-2xl font-black text-text-main mb-3 leading-tight">Your collection is empty</h3>
                        <p className="text-text-muted max-w-sm font-medium">{info.empty}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {papers.map((paper) => (
                            <PaperCard
                                key={paper.id}
                                paper={paper}
                                onPreview={setPreviewPaper}
                                isBookmarked={bookmarkIds.has(paper.id)}
                                onBookmark={handleBookmarkToggle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {previewPaper && (
                <PaperPreview paper={previewPaper} onClose={() => setPreviewPaper(null)} />
            )}
        </div>
    );
}
