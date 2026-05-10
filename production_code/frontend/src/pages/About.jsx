import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import founderImg from '../assets/founder.png';

export default function About() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark font-display selection:bg-primary/20 transition-colors duration-300">
            {/* Header / Hero Section */}
            <div className="relative pt-24 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        About Knowledge Hub
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-text-main tracking-tight leading-[1.1] mb-8 animate-slide-up">
                        Architecting the Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">Academic Intelligence.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-muted font-medium leading-relaxed mb-12 animate-slide-up delay-100">
                        A secure, centralized repository for academic resources, empowering students to share knowledge and dominate their curriculum with precision data.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 animate-slide-up delay-200">
                        <Link to="/dashboard" className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                            Explore Repository
                        </Link>
                        {!user && (
                            <Link to="/register" className="px-8 py-4 bg-bg-surface text-text-main border border-border-main rounded-2xl font-black hover:bg-bg-main hover:scale-105 active:scale-95 transition-all shadow-sm">
                                Join the Network
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Core Values / Platform Details */}
            <div className="max-w-7xl mx-auto px-6 py-24 border-t border-border-main/50">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="space-y-6 group">
                        <div className="w-14 h-14 mx-auto bg-success/5 rounded-2xl flex items-center justify-center text-success border border-success/10 group-hover:bg-success group-hover:text-white transition-all duration-500 shadow-sm">
                            <span className="material-symbols-outlined text-3xl font-bold">diversity_3</span>
                        </div>
                        <h3 className="text-2xl font-black text-text-main tracking-tight">Open Community</h3>
                        <p className="text-text-muted leading-relaxed font-medium">
                            Knowledge Hub is built by students, for students. Anyone can upload papers, help others prepare, and earn recognition along the way. Share what you have, learn from what others share, and let's grow together.
                        </p>
                    </div>
                </div>
            </div>

            {/* Meet the Founder */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="bg-bg-surface border border-border-main rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />

                    <div className="relative flex flex-col lg:flex-row items-center gap-16">
                        {/* Desktop Logo - Hidden on Mobile */}
                        <div className="hidden lg:block w-80 h-80 shrink-0 relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] rotate-6 scale-105" />
                            <div className="absolute inset-0 bg-accent/20 rounded-[3rem] -rotate-6 scale-95" />
                            <div className="relative w-full h-full bg-primary rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center text-white text-8xl font-black">
                                <img src={founderImg} alt="Aakash Modi" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="flex-1 order-1 lg:order-2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-6">
                                Founder & CEO
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter mb-6">Aakash Modi</h2>

                            {/* Mobile Logo - Shown below Name */}
                            <div className="lg:hidden w-48 h-48 mx-auto mb-10 relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] rotate-6 scale-105" />
                                <div className="absolute inset-0 bg-accent/20 rounded-[2.5rem] -rotate-6 scale-95" />
                                <div className="relative w-full h-full bg-primary rounded-[2.2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center text-white text-6xl font-black">
                                    <img src={founderImg} alt="Aakash Modi" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <p className="text-lg md:text-xl text-text-muted font-medium leading-relaxed mb-8 max-w-3xl">
                                Final Year B.Sc Artificial Intelligence student focused on cybersecurity and software development.
                                I build real world projects, perform ethical hacking labs, and develop applications using Java, Python, React.js, and MySQL.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 lg:gap-16 mb-10">
                                <div className="flex flex-col min-h-[100px]">
                                    <p className="text-primary font-black text-xl lg:text-2xl leading-tight tracking-tight mb-3">Artificial Intelligence</p>
                                    <p className="mt-auto text-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Specialization</p>
                                </div>
                                <div className="flex flex-col min-h-[100px]">
                                    <p className="text-accent font-black text-xl lg:text-2xl leading-tight tracking-tight mb-3">Ethical Hacking</p>
                                    <p className="mt-auto text-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Core Expertise</p>
                                </div>
                                <div className="flex flex-col min-h-[100px]">
                                    <p className="text-success font-black text-xl lg:text-2xl leading-none mb-3">React.js</p>
                                    <p className="mt-auto text-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Frontend Stack</p>
                                </div>
                                <div className="flex flex-col min-h-[100px]">
                                    <p className="text-warning font-black text-xl lg:text-2xl leading-none mb-3">MySQL</p>
                                    <p className="mt-auto text-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Data Infrastructure</p>
                                </div>
                            </div>

                            <p className="text-text-muted leading-relaxed font-medium italic border-l-4 border-primary/30 pl-6 py-2">
                                "My goal is to become a skilled cybersecurity professional and software developer who creates secure and impactful digital solutions."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rights & Legal */}
            <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                <h3 className="text-xl font-black text-text-main mb-6 tracking-tight uppercase tracking-[0.2em]">Usage & Rights</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-8 font-medium">
                    © {new Date().getFullYear()} Knowledge Hub. All Rights Reserved. <br />
                    Knowledge Hub is an educational platform designed for academic resource sharing. All contributed content remains the intellectual property of the original creators. We strictly prohibit unauthorized redistribution or commercial use of the repository.
                </p>
                <div className="h-px w-24 bg-border-main mx-auto mb-8" />
                <div className="flex justify-center gap-8 text-xs font-black text-text-muted uppercase tracking-widest">
                    <Link to="/privacy" className="hover:text-primary transition-colors cursor-pointer">Privacy Protocol</Link>
                    <Link to="/terms" className="hover:text-primary transition-colors cursor-pointer">Terms of Service</Link>
                    <Link to="/tutorial" className="hover:text-primary transition-colors cursor-pointer">System Tutorial</Link>
                </div>
            </div>
        </div>
    );
}
