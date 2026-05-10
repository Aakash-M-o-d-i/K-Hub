import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-bg-light font-display transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <Link to="/about" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-8">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to About
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight mb-4">Privacy Protocol</h1>
                    <p className="text-text-muted text-sm font-medium">Last updated: May 10, 2026</p>
                </div>

                <div className="space-y-10 text-text-main">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">1. Information We Collect</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p><strong className="text-text-main">Account Data:</strong> When you register, we collect your name, email address, phone number, department, and semester. This is required to create and maintain your account.</p>
                            <p><strong className="text-text-main">Authentication Data:</strong> Passwords are hashed using bcrypt and never stored in plain text. OAuth users authenticate through Google's secure token system.</p>
                            <p><strong className="text-text-main">Usage Data:</strong> We record uploads, downloads, ratings, and bookmarks to power features like the leaderboard and contribution tracking.</p>
                            <p><strong className="text-text-main">Security Logs:</strong> IP addresses, browser information, and login timestamps are logged for security monitoring and brute-force protection.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">2. How We Use Your Data</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>Your data is used strictly to operate Knowledge Hub. We use it to authenticate your identity, display your profile, track contributions on the leaderboard, and send you relevant notifications about your uploads.</p>
                            <p>We <strong className="text-text-main">do not</strong> sell, rent, or share your personal information with any third party for advertising or marketing purposes.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">3. Data Security</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>All API communication is encrypted. Passwords are hashed with bcrypt. Sessions are tracked using JWT tokens with automatic expiration. Failed login attempts trigger account lockouts to prevent brute-force attacks.</p>
                            <p>File uploads undergo multi-layer validation including extension checks, MIME type verification, magic byte analysis, and malicious content scanning before being stored.</p>
                            <p>Admin actions are fully audited with IP tracking and timestamped logs that cannot be modified or deleted.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">4. Cookies & Sessions</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>We use JWT-based authentication tokens stored in your browser. These tokens are essential for keeping you logged in and are not used for tracking or advertising.</p>
                            <p>You can revoke any active session from your Security settings at any time. Changing your password automatically invalidates all other sessions.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">5. Your Rights</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p><strong className="text-text-main">Access:</strong> You can view all your personal data from your Profile page at any time.</p>
                            <p><strong className="text-text-main">Correction:</strong> You can update your name, department, semester, bio, and avatar from your profile settings.</p>
                            <p><strong className="text-text-main">Deletion:</strong> Account deletion can be requested through an administrator. Upon deletion, your profile and non-approved uploads are permanently removed. Approved papers that are already part of the public repository will be preserved but de-linked from your identity.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">6. Contact</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>For privacy-related questions or data requests, contact us at <strong className="text-text-main">knowledge.pyqs@gmail.com</strong>.</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
