import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-primary text-white/70 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-sm font-bold">school</span>
                            </div>
                            <span className="font-display font-bold text-lg text-white">PYQ Hub</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Access verified previous year question papers from your university's academic repository.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/dashboard" className="hover:text-accent transition-colors">Browse Papers</Link></li>
                            <li><Link to="/upload" className="hover:text-accent transition-colors">Upload Paper</Link></li>
                            <li><Link to="/leaderboard" className="hover:text-accent transition-colors">Leaderboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors">Upload Guidelines</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                            <li><Link to="/terms" className="hover:text-accent transition-colors">Content Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} PYQ Hub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
