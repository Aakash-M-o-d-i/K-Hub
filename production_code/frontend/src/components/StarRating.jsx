import { useState, useRef, useCallback } from 'react';

export default function StarRating({ currentScore, onRate, disabled }) {
    const [hoverScore, setHoverScore] = useState(0);
    const [optimisticScore, setOptimisticScore] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const debounceRef = useRef(null);
    const lastSubmittedRef = useRef(null);

    const displayScore = optimisticScore ?? currentScore ?? 0;

    const handleClick = useCallback((score) => {
        if (disabled) return;


        if (score === lastSubmittedRef.current && score === currentScore) return;


        setOptimisticScore(score);


        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setSubmitting(true);
            try {
                await onRate(score);
                lastSubmittedRef.current = score;
                setOptimisticScore(null);
            } catch {

                setOptimisticScore(null);
            } finally {
                setSubmitting(false);
            }
        }, 300);
    }, [onRate, disabled, currentScore]);

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverScore || displayScore);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => setHoverScore(star)}
                        onMouseLeave={() => setHoverScore(0)}
                        className="p-0 bg-transparent border-none cursor-pointer transition-transform duration-150 hover:scale-125 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ lineHeight: 0 }}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <span
                            className={`material-symbols-outlined text-[22px] transition-colors duration-200 ${isFilled ? 'text-amber-400' : 'text-white/30'
                                }`}
                            style={{
                                fontVariationSettings: isFilled
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                            }}
                        >
                            star
                        </span>
                    </button>
                );
            })}
            {submitting && (
                <span className="ml-1 text-[10px] text-white/50 animate-pulse">
                    Saving...
                </span>
            )}
        </div>
    );
}
