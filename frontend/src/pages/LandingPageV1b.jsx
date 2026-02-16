import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Footer from '../components/Footer';

export default function LandingPageV1b() {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) navigate(`/dashboard?q=${encodeURIComponent(search)}`);
    };

    const stats = [
        { icon: 'library_books', value: '12,450+', label: 'Papers Indexed' },
        { icon: 'account_balance', value: '45', label: 'Departments' },
        { icon: 'verified_user', value: '5,000+', label: 'Verified Students' },
    ];

    const popular = ['Calculus II', 'Data Structures', 'Organic Chemistry'];

    return (
        <div className="min-h-screen flex flex-col font-display bg-[#f6f7f8]">
            {/* Sticky Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#f6f7f8]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                            <img src="/logo.png" alt="Knowledge Hub Logo" className="w-8 h-8 object-contain" />
                            <span className="font-bold text-xl tracking-tight text-slate-900">Knowledge Hub</span>
                        </Link>
                        {/* Nav Links */}
                        <div className="hidden md:flex space-x-8 items-center">
                            {['Departments', 'Resources', 'Community', 'Leaderboard', 'About'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-slate-600 hover:text-[#2D6A4F] transition-colors font-medium"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                        {/* Auth Actions */}
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-slate-600 hover:text-[#2D6A4F] font-medium hidden sm:block"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-[#2D6A4F]/30"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-grow relative flex items-center justify-center pt-10 pb-20">
                {/* Dot Grid Pattern */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-60"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(45, 106, 79, 0.1) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f6f7f8]/50 to-[#f6f7f8] pointer-events-none" />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 text-[#2D6A4F] text-sm font-semibold mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D6A4F] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2D6A4F]" />
                        </span>
                        Now indexing Fall 2023 Semesters
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                        Your Academic Archive <br />
                        <span className="text-[#2D6A4F]">Simplified.</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="max-w-2xl text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                        Access over 12,000+ previous year question papers instantly.{' '}
                        <span className="hidden md:inline">
                            Stop searching through dusty library folders and start studying smarter today.
                        </span>
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-12 group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#2D6A4F] to-emerald-400 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                        <div className="relative flex items-center bg-white rounded-xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-200 h-16 md:h-20 transition-all focus-within:ring-2 focus-within:ring-[#2D6A4F] focus-within:border-[#2D6A4F]">
                            <span className="material-symbols-outlined text-slate-400 ml-6 text-2xl md:text-3xl">search</span>
                            <input
                                className="w-full h-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-lg md:text-xl px-4 focus:ring-0 focus:outline-none"
                                placeholder="Search for 'Computer Science 101' or 'MAT202'..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="hidden md:flex items-center justify-center bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 text-white h-12 px-8 mr-3 rounded-lg font-semibold transition-colors"
                            >
                                Search
                            </button>
                            <button
                                type="submit"
                                className="md:hidden flex items-center justify-center bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 text-white w-12 h-12 mr-2 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                        {/* Popular Searches */}
                        <div className="flex gap-3 mt-3 justify-center text-sm text-slate-500">
                            <span>Popular:</span>
                            {popular.map((item, idx) => (
                                <span key={item} className="flex items-center gap-3">
                                    <a className="hover:text-[#2D6A4F] hover:underline cursor-pointer">{item}</a>
                                    {idx < popular.length - 1 && <span className="text-slate-300">•</span>}
                                </span>
                            ))}
                        </div>
                    </form>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                        <Link
                            to="/dashboard"
                            className="w-full sm:w-auto min-w-[200px] h-14 bg-[#2D6A4F] text-white rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                        >
                            <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform text-xl">download</span>
                            Download Papers
                        </Link>
                        <Link
                            to="/upload"
                            className="w-full sm:w-auto min-w-[200px] h-14 bg-transparent border-2 border-slate-300 text-slate-700 rounded-lg font-bold text-lg hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-all flex items-center justify-center gap-2 group"
                        >
                            <span className="material-symbols-outlined group-hover:-translate-y-0.5 transition-transform text-xl">upload_file</span>
                            Upload &amp; Earn
                        </Link>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-20 w-full border-t border-slate-200 pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {stats.map((stat) => (
                                <div key={stat.label} className="flex items-center justify-center gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-lg">
                                        <span className="material-symbols-outlined text-[#2D6A4F] text-3xl">{stat.icon}</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                        <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom gradient strip */}
            <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-[#2D6A4F] to-emerald-800" />

            <Footer />
        </div>
    );
}
