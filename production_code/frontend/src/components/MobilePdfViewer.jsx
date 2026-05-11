import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker from pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

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
            if (err?.name !== 'RenderingCancelled') {
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
        <div ref={containerRef} className="relative flex flex-col w-full h-full bg-bg-main">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-2
                bg-bg-surface/95 backdrop-blur-md border-b border-border-main text-text-main text-xs font-medium">
                {/* Page navigation */}
                <div className="flex items-center gap-1">
                    <button onClick={prevPage} disabled={currentPage <= 1}
                        className="p-1.5 rounded-lg hover:bg-bg-main disabled:opacity-30 transition-colors">
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <span className="tabular-nums min-w-[4rem] text-center">
                        {currentPage} / {totalPages}
                    </span>
                    <button onClick={nextPage} disabled={currentPage >= totalPages}
                        className="p-1.5 rounded-lg hover:bg-bg-main disabled:opacity-30 transition-colors">
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center gap-1">
                    <button onClick={zoomOut} disabled={scale <= 0.5}
                        className="p-1.5 rounded-lg hover:bg-bg-main disabled:opacity-30 transition-colors">
                        <span className="material-symbols-outlined text-base">zoom_out</span>
                    </button>
                    <span className="tabular-nums min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} disabled={scale >= 3}
                        className="p-1.5 rounded-lg hover:bg-bg-main disabled:opacity-30 transition-colors">
                        <span className="material-symbols-outlined text-base">zoom_in</span>
                    </button>
                </div>
            </div>

            {/* Canvas area */}
            <div className="flex-1 overflow-auto flex justify-center p-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-text-muted text-xs">Loading PDF…</p>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        className="shadow-lg rounded-lg max-w-full"
                        style={{ touchAction: 'pan-y pinch-zoom' }}
                    />
                )}
            </div>
        </div>
    );
}
