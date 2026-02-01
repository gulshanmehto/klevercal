import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo-dark.png" alt="DeeMeet" className="h-10 w-auto object-contain" />
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Terms of Service</h1>
                    <p className="text-slate-600 dark:text-slate-400">Last Updated: February 2, 2026</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 prose dark:prose-invert max-w-none shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        By accessing or using DeeMeet, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Description of Service</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        DeeMeet provides an intelligent scheduling platform that allowed users to create meeting types, share booking links, and manage appointments.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. User Accounts</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Acceptable Use</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        You agree not to use DeeMeet for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Prohibited activities include spamming, unauthorized access, and any interference with the platform's security.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Intellectual Property</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        The DeeMeet platform, including its design, code, and logo, is the property of DeeMeet and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Limitation of Liability</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        DeeMeet is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Termination</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We reserve the right to suspend or terminate your account at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Changes to Terms</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We may modify these Terms at any time. Your continued use of the service after such modifications constitutes your acceptance of the new Terms.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Contact Information</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Questions about the Terms of Service should be sent to legal@deemeet.in.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo-dark.png" alt="DeeMeet" className="h-8 w-auto object-contain" />
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        © 2026 DeeMeet. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TermsPage;
