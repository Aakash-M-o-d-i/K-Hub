import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        papers: 0,
        departments: 0,
        users: 0,
        popular_tags: ["Calculus II", "Data Structures", "Organic Chemistry"],
    });
    const [topDepts, setTopDepts] = useState([]);
    const [topScholars, setTopScholars] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Fetch stats
        api.get("/papers/stats/public")
            .then((res) => setStats(res.data))
            .catch((err) => console.error("Error fetching stats:", err));

        // Fetch leaderboard preview
        api.get("/leaderboard/departments")
            .then((res) => setTopDepts(res.data.departments?.slice(0, 3) || []))
            .catch(() => { });

        api.get("/leaderboard/scholars?limit=5")
            .then((res) => setTopScholars(res.data.scholars || []))
            .catch(() => { });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate("/dashboard");
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
        return num;
    };

    return (
        <div className="font-display text-slate-800 dark:text-slate-100 bg-landing-bg-light dark:bg-landing-bg-dark min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-landing-bg-dark/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                            <img src="/logo.png" alt="Knowledge Hub Logo" className="w-8 h-8 object-contain" />
                            <span className="font-bold text-xl tracking-tight text-white">Knowledge Hub</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex space-x-8 items-center">
                            <Link className="text-slate-300 hover:text-landing-primary transition-colors font-medium" to="/dashboard">Browse</Link>
                            <Link className="text-slate-300 hover:text-landing-primary transition-colors font-medium" to="/leaderboard">Leaderboard</Link>
                            <Link className="text-slate-300 hover:text-landing-primary transition-colors font-medium" to="/tutorial">Tutorial</Link>
                            <Link className="text-slate-300 hover:text-landing-primary transition-colors font-medium" to="/about">About</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <Link className="bg-landing-primary hover:bg-landing-primary/90 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-landing-primary/30" to={user.role === 'student' ? '/dashboard' : '/sector-delta'}>
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link className="text-slate-300 hover:text-landing-primary font-medium" to="/login">Sign In</Link>
                                    <Link className="bg-landing-primary hover:bg-landing-primary/90 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-landing-primary/30" to="/register">
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-slate-400"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="material-icons">{isMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 py-4 px-4 space-y-4 animate-fade-in">
                        <Link className="block text-slate-300 font-medium" to="/dashboard" onClick={() => setIsMenuOpen(false)}>Browse Papers</Link>
                        <Link className="block text-slate-300 font-medium" to="/leaderboard" onClick={() => setIsMenuOpen(false)}>Leaderboard</Link>
                        {user ? (
                            <Link className="block w-full text-center bg-landing-primary text-white py-3 rounded-xl font-bold" to={user.role === 'student' ? '/dashboard' : '/sector-delta'} onClick={() => setIsMenuOpen(false)}>
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link className="block text-slate-300 font-medium" to="/tutorial" onClick={() => setIsMenuOpen(false)}>Tutorial</Link>
                                <Link className="block text-slate-300 font-medium" to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
                                <Link className="block w-full text-center bg-landing-primary text-white py-3 rounded-xl font-bold" to="/register" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow relative overflow-hidden bg-landing-bg-dark flex flex-col items-center">
                {/* Hero Background Video (Top Half) */}
                <div className="absolute top-0 inset-x-0 h-[85vh] z-0 overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        style={{ filter: 'brightness(0.9) saturate(1.2)' }}
                    >
                        <source src="/285224_medium.mp4" type="video/mp4" />
                    </video>
                    {/* Immersive Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-landing-bg-dark/80 via-transparent to-landing-bg-dark" />
                    <div className="absolute inset-0 bg-gradient-to-r from-landing-bg-dark/60 via-transparent to-landing-bg-dark/60" />
                    {/* Subtle blue accent glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-landing-primary/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-landing-primary text-sm font-semibold mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-landing-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-landing-primary"></span>
                        </span>
                        Now indexing Fall 2023 Semesters
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                        Your Knowledge Hub <br />
                        <span className="text-landing-primary drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">Simplified.</span>
                    </h1>

                    <p className="max-w-2xl text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
                        Access over {formatNumber(stats.papers)} previous year question papers instantly.
                        <span className="hidden md:inline"> Stop searching through dusty library folders and start studying smarter today.</span>
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-12 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-landing-primary to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                        <div className="relative flex items-center bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-white/10 h-16 md:h-20 transition-all focus-within:ring-2 focus-within:ring-landing-primary focus-within:border-landing-primary">
                            <span className="material-icons text-slate-400 ml-6 text-2xl md:text-3xl">search</span>
                            <input
                                className="w-full h-full bg-transparent border-none text-white placeholder-slate-400 text-lg md:text-xl px-4 focus:ring-0 focus:outline-none"
                                placeholder="Search for 'Computer Science 101' or 'MAT202'..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="hidden md:flex items-center justify-center bg-landing-primary hover:bg-landing-primary/90 text-white h-12 px-8 mr-3 rounded-lg font-semibold transition-colors">
                                Search
                            </button>
                            <button type="submit" className="md:hidden flex items-center justify-center bg-landing-primary hover:bg-landing-primary/90 text-white w-12 h-12 mr-2 rounded-lg transition-colors">
                                <span className="material-icons">arrow_forward</span>
                            </button>
                        </div>

                        {/* Popular Tags Dynamic */}
                        <div className="flex flex-wrap gap-3 mt-4 justify-center text-sm text-slate-400">
                            <span>Popular:</span>
                            {stats.popular_tags.map((tag, idx) => (
                                <React.Fragment key={tag}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/dashboard?q=${encodeURIComponent(tag)}`)}
                                        className="hover:text-landing-primary hover:underline transition-colors"
                                    >
                                        {tag}
                                    </button>
                                    {idx < stats.popular_tags.length - 1 && <span className="text-slate-600">•</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </form>

                    {/* Button Group */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                        <Link to="/dashboard" className="w-full sm:w-auto min-w-[200px] h-14 bg-landing-primary text-white rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group">
                            <span className="material-icons group-hover:translate-y-0.5 transition-transform text-xl">download</span>
                            Download Papers
                        </Link>
                        <Link to="/register" className="w-full sm:w-auto min-w-[200px] h-14 bg-white/5 backdrop-blur-md border-2 border-white/20 text-white rounded-lg font-bold text-lg hover:border-landing-primary hover:text-landing-primary transition-all flex items-center justify-center gap-2 group">
                            <span className="material-icons group-hover:-translate-y-0.5 transition-transform text-xl">upload_file</span>
                            Upload & Earn
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="mt-20 w-full border-t border-white/10 pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                                <div className="p-3 bg-landing-primary/20 rounded-xl">
                                    <span className="material-icons text-landing-primary text-3xl">library_books</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-white">
                                        {formatNumber(stats.papers)}
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium">Papers Indexed</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                                <div className="p-3 bg-landing-primary/20 rounded-xl">
                                    <span className="material-icons text-landing-primary text-3xl">account_balance</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-white">
                                        {stats.departments}
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium">Departments</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                                <div className="p-3 bg-landing-primary/20 rounded-xl">
                                    <span className="material-icons text-landing-primary text-3xl">verified_user</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-white">
                                        {formatNumber(stats.users)}
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium">Verified Students</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Hierarchy - NEW SECTION */}
                    <div className="mt-24 w-full text-left">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Academic Hierarchy</h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Live Departmental Standings</p>
                            </div>
                            <Link to="/leaderboard" className="text-landing-primary font-bold text-sm hover:underline flex items-center gap-1 group">
                                Full Standings
                                <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Departments */}
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl shadow-black/10">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="material-icons text-sm text-landing-primary">stars</span>
                                    Top Rankings
                                </h3>
                                <div className="space-y-6">
                                    {topDepts.map((dept, i) => {
                                        const maxPoints = topDepts[0]?.total_points || 1;
                                        const pct = Math.round((dept.total_points / maxPoints) * 100);
                                        return (
                                            <div key={dept.department.id} className="group">
                                                <div className="flex justify-between items-end mb-2">
                                                    <div>
                                                        <span className="text-[9px] font-black text-landing-primary uppercase bg-landing-primary/10 px-2 py-0.5 rounded mr-2">#{i + 1}</span>
                                                        <span className="font-bold text-slate-200 text-sm">{dept.department.name}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500">{dept.total_papers} Papers</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-landing-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--color-landing-primary-rgb),0.3)]"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {topDepts.length === 0 && <p className="text-slate-500 text-center py-4 text-xs font-bold uppercase tracking-widest italic">Recalibrating rankings...</p>}
                                </div>
                            </div>

                            {/* Top Contributors */}
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl shadow-black/10">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="material-icons text-sm text-landing-primary">military_tech</span>
                                    Wall of Fame
                                </h3>
                                <div className="space-y-4">
                                    {topScholars.map((s, i) => (
                                        <div key={s.user.id} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-2xl transition-all">
                                            <div className="w-8 h-8 rounded-full bg-landing-primary text-white flex items-center justify-center font-black text-xs">
                                                {s.user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-200">{s.user.name}</p>
                                                <p className="text-[9px] font-black text-slate-500 uppercase">{s.user.department?.code || 'Gen'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-landing-primary">{s.uploads}</p>
                                                <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Papers</p>
                                            </div>
                                        </div>
                                    ))}
                                    {topScholars.length === 0 && <p className="text-slate-500 text-center py-4 text-xs font-bold uppercase tracking-widest italic">Finding legends...</p>}
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                    <Link to="/leaderboard" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] hover:text-landing-primary transition-colors">Join the ranks</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-6 flex justify-center items-center bg-landing-bg-dark border-t border-white/5">
                <p className="text-slate-500 text-sm font-medium tracking-wide">
                    Build by <span className="text-slate-400 font-semibold">Aakash Modi</span>
                </p>
            </footer>

            <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-landing-primary to-blue-800"></div>
        </div>
    );
}
