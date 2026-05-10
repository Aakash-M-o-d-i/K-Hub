import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function NotFound() {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [glitchActive, setGlitchActive] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0e1a]">
            <div
                className="absolute inset-0 opacity-30 transition-all duration-700"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(56, 189, 248, 0.12), transparent 60%)`,
                }}
            />

            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                <div className="mb-8 relative">
                    <h1
                        className={`text-[140px] sm:text-[180px] md:text-[220px] font-black leading-none tracking-tighter select-none transition-all duration-100 ${glitchActive ? 'translate-x-[2px] skew-x-1' : ''}`}
                        style={{
                            fontFamily: 'var(--font-display)',
                            background: 'linear-gradient(135deg, #38bdf8 0%, #1a355b 40%, #28497a 70%, #38bdf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: glitchActive ? '2px 0 #ef4444, -2px 0 #38bdf8' : 'none',
                            filter: glitchActive ? 'hue-rotate(10deg)' : 'none',
                        }}
                    >
                        404
                    </h1>

                    {glitchActive && (
                        <h1
                            className="absolute inset-0 text-[140px] sm:text-[180px] md:text-[220px] font-black leading-none tracking-tighter select-none opacity-30"
                            style={{
                                fontFamily: 'var(--font-display)',
                                color: '#ef4444',
                                transform: 'translate(-3px, 2px)',
                                clipPath: 'polygon(0 30%, 100% 30%, 100% 60%, 0 60%)',
                            }}
                        >
                            404
                        </h1>
                    )}
                </div>

                <div className="space-y-4 mb-10">
                    <h2
                        className="text-2xl sm:text-3xl font-bold text-white/90"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Page Not Found
                    </h2>
                    <p className="text-white/40 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                        The page you're looking for doesn't exist or you don't have permission to access it.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/dashboard"
                        className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]"
                        style={{
                            background: 'linear-gradient(135deg, #1a355b, #28497a)',
                        }}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="material-symbols-outlined text-[18px] relative z-10 transition-transform group-hover:-translate-x-0.5">
                            arrow_back
                        </span>
                        <span className="relative z-10">Back to Dashboard</span>
                    </Link>

                    <Link
                        to="/"
                        className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white/60 border border-white/10 hover:border-white/25 hover:text-white/90 transition-all duration-300 hover:bg-white/5"
                    >
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110">
                            home
                        </span>
                        <span>Go Home</span>
                    </Link>
                </div>

                <div className="mt-16 flex items-center justify-center gap-3 text-white/20 text-xs">
                    <div className="w-8 h-px bg-white/10" />
                    <span style={{ fontFamily: 'var(--font-display)' }}>KNOWLEDGEHUB</span>
                    <div className="w-8 h-px bg-white/10" />
                </div>
            </div>

            <style>{`
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
            `}</style>
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                    animation: 'scanline 8s linear infinite',
                }}
            />
        </div>
    );
}
