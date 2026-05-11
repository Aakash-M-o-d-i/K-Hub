import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Use CDN worker to avoid Vite/Rollup bundling issues with the worker file
pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * MobilePdfViewer — renders PDFs page-by-page on a <canvas> element.
 * Mobile browsers cannot display PDFs inside <iframe>; this component
 * uses PDF.js to paint each page onto a canvas, giving a true in-app
 * preview on every device.
 */
export default function MobilePdfViewer({ url, title }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1);
    const renderTaskRef = useRef(null);

    // Load the PDF document
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        pdfjsLib.getDocument({ url, withCredentials: true }).promise
            .then((doc) => {
                if (cancelled) return;
                setPdfDoc(doc);
                setTotalPages(doc.numPages);
                setCurrentPage(1);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('PDF load error:', err);
                setError('Unable to load PDF preview');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [url]);

    // Render a single page
    const renderPage = useCallback(async (pageNum) => {
        if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

        // Cancel any in-flight render
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
        }

        try {
            const page = await pdfDoc.getPage(pageNum);
            const container = containerRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Fit page width to the container
            const containerWidth = container.clientWidth - 16; // 8px padding each side
            const unscaledViewport = page.getViewport({ scale: 1 });
            const fitScale = containerWidth / unscaledViewport.width;
            const viewport = page.getViewport({ scale: fitScale * scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;

            const task = page.render({ canvasContext: ctx, viewport });
            renderTaskRef.current = task;
            await task.promise;
            renderTaskRef.current = null;
        } catch (err) {
            // Silently ignore cancelled renders to avoid console clutter
            if (err?.name !== 'RenderingCancelledException' && err?.name !== 'RenderingCancelled') {
                console.error('Render error:', err);
            }
        }
    }, [pdfDoc, scale]);

    // Re-render when page or scale changes
    useEffect(() => {
        renderPage(currentPage);
    }, [currentPage, renderPage]);

    // Re-render on container resize
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(() => renderPage(currentPage));
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [currentPage, renderPage]);

    const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
    const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
    const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));
    const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-red-400/60 mb-3">error</span>
                <p className="text-text-muted text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative flex flex-col w-full h-full bg-bg-main overflow-hidden">
            {/* Canvas area */}
            <div className="flex-1 overflow-auto flex justify-center p-2 pb-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-text-muted text-xs">Loading PDF…</p>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        className="shadow-xl rounded-lg max-w-full"
                        style={{ touchAction: 'pan-y pinch-zoom' }}
                    />
                )}
            </div>

            {/* Toolbar — Bottom Floating Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5
                bg-bg-surface/80 backdrop-blur-xl border border-border-main/50 rounded-2xl shadow-2xl
                text-text-main text-xs font-medium min-w-[280px] justify-between">
                
                {/* Page navigation */}
                <div className="flex items-center gap-1.5">
                    <button onClick={prevPage} disabled={currentPage <= 1}
                        className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                    <span className="tabular-nums font-bold tracking-tight px-1">
                        {currentPage} <span className="text-text-muted/60 font-normal mx-0.5">/</span> {totalPages}
                    </span>
                    <button onClick={nextPage} disabled={currentPage >= totalPages}
                        className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                </div>

                <div className="w-[1px] h-4 bg-border-main/50" />

                {/* Zoom controls */}
                <div className="flex items-center gap-1.5">
                    <button onClick={zoomOut} disabled={scale <= 0.5}
                        className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-xl font-light">zoom_out</span>
                    </button>
                    <span className="tabular-nums min-w-[3rem] text-center font-bold">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} disabled={scale >= 3}
                        className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-xl font-light">zoom_in</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
