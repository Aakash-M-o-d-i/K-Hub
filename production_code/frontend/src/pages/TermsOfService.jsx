import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-bg-light font-display transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <Link to="/about" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-8">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to About
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-text-muted text-sm font-medium">Last updated: May 10, 2026</p>
                </div>

                <div className="space-y-10 text-text-main">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">1. Acceptance of Terms</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>By creating an account or using Knowledge Hub, you agree to these Terms of Service. If you do not agree, you must not use the platform. We reserve the right to update these terms at any time.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">2. Eligibility</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>Knowledge Hub is intended for university students. You must provide a valid email address and accurate academic information (department, semester) during registration. Fake or misleading accounts may be suspended or permanently deleted without notice.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">3. User Contributions</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>You may upload previous year question papers and academic resources. By uploading, you confirm that:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>The content is a legitimate academic resource (question papers, notes, etc.).</li>
                                <li>You have the right to share it and it does not violate any copyright.</li>
                                <li>The file does not contain malware, offensive material, or personal data of others.</li>
                            </ul>
                            <p>All uploads go through a moderation review. Administrators have full authority to approve, reject, or delete any submission without prior notice.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">4. Prohibited Actions</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 text-[15px] leading-relaxed text-text-muted font-medium">
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Uploading copyrighted material without proper authorization.</li>
                                <li>Attempting to access admin panels, restricted endpoints, or other users' accounts.</li>
                                <li>Using automated tools (bots, scrapers, brute-force tools) against the platform.</li>
                                <li>Uploading malicious files, scripts, or executable content.</li>
                                <li>Impersonating another user or creating duplicate accounts.</li>
                                <li>Manipulating the leaderboard, ratings, or download counts through fake activity.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">5. Account Suspension & Bans</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>We reserve the right to ban or suspend any user account that violates these terms. Banned users lose access to all platform features. Repeated violations may result in permanent deletion of the account and all associated data.</p>
                            <p>Administrators may also ban users at their discretion for behaviour that disrupts the community, even if not explicitly listed above.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">6. Intellectual Property</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 space-y-3 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>All contributed content remains the intellectual property of the original creator. Knowledge Hub does not claim ownership of any uploaded material.</p>
                            <p>The platform's design, branding, codebase, and user interface are the property of Knowledge Hub and may not be copied, distributed, or reproduced without written permission.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">7. Limitation of Liability</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>Knowledge Hub is provided "as is" without warranties of any kind. We are not responsible for the accuracy, completeness, or reliability of any uploaded content. Use downloaded materials at your own discretion. We are not liable for any academic, legal, or personal consequences arising from the use of this platform.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black tracking-tight text-primary">8. Contact</h2>
                        <div className="bg-bg-surface border border-border-main rounded-2xl p-6 text-[15px] leading-relaxed text-text-muted font-medium">
                            <p>For questions about these terms, reach out to <strong className="text-text-main">knowledge.pyqs@gmail.com</strong>.</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
