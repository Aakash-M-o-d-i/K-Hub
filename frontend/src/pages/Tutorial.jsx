import React from 'react';
import { Link } from 'react-router-dom';

export default function Tutorial() {
    return (
        <div className="min-h-screen bg-bg-main p-4 lg:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 text-center lg:text-left">
                    <h1 className="font-display text-4xl lg:text-5xl font-black text-text-main mb-4 tracking-tight">
                        Mastering <span className="text-primary italic">Knowledge Hub</span>
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
                        Welcome to the community! Knowledge Hub is built on collective contribution.
                        Follow this guide to start sharing and accessing academic resources efficiently.
                    </p>
                </div>

                {/* Tutorial Grid */}
                <div className="grid gap-12">

                    {/* Step 1: Uploading */}
                    <section className="relative group overflow-hidden bg-bg-surface rounded-[2.5rem] border border-border-main p-8 lg:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10 lg:flex gap-12 items-center">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-6">
                                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                                    Contribution Protocol
                                </div>
                                <h2 className="text-3xl font-bold text-text-main mb-6">How to Upload Papers</h2>
                                <ol className="space-y-6">
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0 text-sm shadow-lg shadow-primary/20">1</div>
                                        <p className="text-text-main font-medium leading-relaxed">
                                            Locate the <span className="text-primary font-black">Upload</span> button in the top navigation bar.
                                            On mobile, look for the upload icon next to your profile.
                                        </p>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0 text-sm shadow-lg shadow-primary/20">2</div>
                                        <p className="text-text-main font-medium leading-relaxed">
                                            Drag & drop your question papers or selection from your files. We support
                                            <span className="text-text-muted italic"> PDF, JPG, and PNG</span> formats.
                                        </p>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0 text-sm shadow-lg shadow-primary/20">3</div>
                                        <p className="text-text-main font-medium leading-relaxed">
                                            Fill in the metadata: <span className="font-bold underline decoration-primary/30">Subject Code</span>,
                                            <span className="font-bold underline decoration-primary/30">Exam Type</span>, and
                                            <span className="font-bold underline decoration-primary/30">Semester</span>.
                                            Accurate data helps others find your contribution!
                                        </p>
                                    </li>
                                </ol>
                            </div>
                            <div className="lg:w-2/5 mt-8 lg:mt-0">
                                <div className="aspect-square bg-bg-main rounded-[2rem] border-2 border-dashed border-border-main flex flex-col items-center justify-center p-8 text-center group/btn shadow-inner">
                                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-4 transition-transform group-hover/btn:scale-110">
                                        <span className="material-symbols-outlined text-4xl">add_circle</span>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-text-muted mb-2">Interactive Preview</p>
                                    <Link
                                        to="/upload/new"
                                        className="px-6 py-3 bg-primary text-white text-xs font-black rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                                    >
                                        Try Uploading Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Downloading */}
                    <section className="relative group overflow-hidden bg-bg-surface rounded-[2.5rem] border border-border-main p-8 lg:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-success/5">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -ml-32 -mt-32 group-hover:bg-success/10 transition-colors" />

                        <div className="relative z-10 lg:flex flex-row-reverse gap-12 items-center">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full text-success text-xs font-black uppercase tracking-widest mb-6">
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Resource Retrieval
                                </div>
                                <h2 className="text-3xl font-bold text-text-main mb-6">How to Download</h2>
                                <ol className="space-y-6 text-right lg:text-left">
                                    <li className="flex flex-row-reverse lg:flex-row gap-4">
                                        <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center font-black shrink-0 text-sm shadow-lg shadow-success/20">1</div>
                                        <p className="text-text-main font-medium leading-relaxed">
                                            Search for your subject code or title using the <span className="text-primary font-black">Global Search bar</span>
                                            at the top of every page.
                                        </p>
                                    </li>
                                    <li className="flex flex-row-reverse lg:flex-row gap-4">
                                        <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center font-black shrink-0 text-sm shadow-lg shadow-success/20">2</div>
                                        <p className="text-text-main font-medium leading-relaxed">
                                            Click on any paper card to open the <span className="font-black italic">Premium Preview</span>.
                                            You can scroll through the document without downloading!
                                        </p>
                                    </li>
                                    <li className="flex flex-row-reverse lg:flex-row gap-4">
                                        <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center font-black shrink-0 text-sm shadow-lg shadow-success/20">3</div>
                                        <p className="text-text-main font-medium leading-relaxed">
                                            Found what you need? Hit the massive <span className="text-success font-black uppercase">Download Paper</span> button
                                            inside the preview window to save it to your device.
                                        </p>
                                    </li>
                                </ol>
                            </div>
                            <div className="lg:w-2/5 mt-8 lg:mt-0">
                                <div className="p-8 bg-bg-main rounded-[2rem] border border-border-main relative overflow-hidden group/card shadow-inner">
                                    <div className="h-40 bg-bg-surface rounded-xl border border-border-main mb-4 flex items-center justify-center text-text-muted/20 relative">
                                        <span className="material-symbols-outlined text-6xl">description</span>
                                        <div className="absolute bottom-3 right-3 bg-success/20 text-success px-2 py-1 rounded text-[10px] font-black">PREVIEW ACTIVE</div>
                                    </div>
                                    <div className="h-4 w-3/4 bg-text-muted/10 rounded-full mb-2" />
                                    <div className="h-4 w-1/2 bg-text-muted/10 rounded-full mb-6" />
                                    <button className="w-full py-3 bg-success text-white text-xs font-black rounded-xl hover:shadow-xl hover:shadow-success/30 transition-all cursor-default">
                                        Download Demo Paper
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pro Tip Section */}
                    <div className="bg-gradient-to-br from-primary to-accent rounded-[2rem] p-8 lg:p-12 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-150" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl">
                                <span className="material-symbols-outlined text-4xl">emoji_objects</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight">Pro Tip: Use Subject Codes</h3>
                                <p className="text-white/80 leading-relaxed font-medium">
                                    Subject names can vary, but codes like <code className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">MAT201</code>
                                    are universal. Use them in search to find precisely what you need in seconds.
                                </p>
                            </div>
                            <Link
                                to="/dashboard"
                                className="mt-4 md:mt-0 md:ml-auto px-8 py-4 bg-white text-primary font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Start Browsing
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center pb-20">
                    <p className="text-text-muted text-sm font-medium">
                        Still have questions? Reach out to your local Department Moderator or check our <span className="text-primary font-bold">Community Guidelines</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}

