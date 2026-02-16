import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PaperCard from '../components/PaperCard';
import FilterBar from '../components/FilterBar';
import PaperPreview from '../components/PaperPreview';

export default function Dashboard() {
    const [papers, setPapers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({ department_id: '', semester: '', year: '', exam_type: '', sort: 'newest' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [previewPaper, setPreviewPaper] = useState(null);
    const [bookmarkIds, setBookmarkIds] = useState(new Set());
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    // Reset page on search or filter change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, filters.department_id, filters.semester, filters.year, filters.exam_type]);

    // Fetch departments on mount
    useEffect(() => {
        api.get('/papers/departments').then((res) => setDepartments(res.data.departments)).catch(() => { });
    }, []);

    // Fetch bookmarks if logged in
    const fetchBookmarks = () => {
        api.get('/papers/me/bookmarks').then((res) => {
            setBookmarkIds(new Set(res.data.papers.map(p => p.id)));
        }).catch(() => { });
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    // Fetch papers when filters or page changes
    useEffect(() => {
        setLoading(true);
        const params = { page, per_page: 12 };
        if (filters.department_id) params.department_id = filters.department_id;
        if (filters.semester) params.semester = filters.semester;
        if (filters.year) params.year = filters.year;
        if (filters.exam_type) params.exam_type = filters.exam_type;
        if (filters.sort) params.sort = filters.sort;
        if (searchQuery) params.search = searchQuery;

        api.get('/papers', { params })
            .then((res) => {
                setPapers(res.data.papers);
                setTotalPages(res.data.pages);
                setTotal(res.data.total);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [filters, page, searchQuery]);

    return (
        <div className="flex-1 overflow-y-auto bg-bg-main">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Page header */}
                <div className="mb-2">
                    <h1 className="font-display text-2xl font-black text-text-main">Browse Papers</h1>
                    <p className="text-sm text-text-muted mt-1">
                        {searchQuery
                            ? `Showing results for "${searchQuery}" · ${total} found`
                            : (filters.department_id || filters.semester || filters.year || filters.exam_type)
                                ? `${total} papers matching your criteria`
                                : total > 0 ? `${total} papers available` : 'Explore the question paper library'}
                    </p>
                </div>

                {/* Filters */}
                <FilterBar departments={departments} filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />

                {/* Papers grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-bg-surface rounded-2xl border border-border-main p-5 animate-pulse">
                                <div className="h-6 w-20 bg-text-muted/10 rounded-lg mb-4" />
                                <div className="h-4 w-24 bg-text-muted/5 rounded mb-2" />
                                <div className="h-5 w-full bg-text-muted/10 rounded mb-1" />
                                <div className="h-5 w-3/4 bg-text-muted/5 rounded mb-4" />
                                <div className="h-4 w-full bg-text-muted/5 rounded mb-4" />
                                <div className="h-8 w-full bg-text-muted/10 rounded" />
                            </div>
                        ))}
                    </div>
                ) : papers.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-text-muted/30 mb-4 block">search_off</span>
                        <h3 className="text-lg font-semibold text-text-muted mb-2">No papers found</h3>
                        <p className="text-sm text-text-muted/60">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
                            {papers.map((paper) => (
                                <PaperCard
                                    key={paper.id}
                                    paper={paper}
                                    onPreview={setPreviewPaper}
                                    isBookmarked={bookmarkIds.has(paper.id)}
                                    onBookmark={(p, isB) => {
                                        setBookmarkIds(prev => {
                                            const next = new Set(prev);
                                            if (isB) next.add(p.id);
                                            else next.delete(p.id);
                                            return next;
                                        });
                                    }}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all
                        ${page === pageNum
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Paper Preview Modal */}
            {previewPaper && (
                <PaperPreview paper={previewPaper} onClose={() => setPreviewPaper(null)} />
            )}
        </div>
    );
}
