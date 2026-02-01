import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicyPage = () => {
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
                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-600 dark:text-slate-400">Last Updated: February 2, 2026</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 prose dark:prose-invert max-w-none shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        At DeeMeet, we collect information to provide better services to all our users. This includes:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li><strong>Account Information:</strong> Name, email address, and profile picture when you sign up.</li>
                        <li><strong>Calendar Data:</strong> If you connect your calendar, we access your calendar events to check availability and prevent double-bookings.</li>
                        <li><strong>Meeting Information:</strong> Details about the meetings scheduled through our platform, including participant names and times.</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our application.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. How We Use Information</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Personal data is processed only to provide our scheduling services. This includes:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li>Providing, maintaining, and improving our services.</li>
                        <li>Processing transactions and sending related information.</li>
                        <li>Sending technical notices, updates, security alerts, and support messages.</li>
                        <li>Responding to your comments, questions, and requests.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Data Security</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We use industry-standard security measures to protect your information. All data is encrypted in transit and at rest. We do not sell your personal data to third parties.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Third-Party Integrations</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        DeeMeet integrates with third-party services like Google Calendar, Outlook, and Apple iCloud. These services have their own privacy policies, and we encourage you to review them.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Your Choices</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        You can access, update, or delete your account information at any time through your profile settings. You can also disconnect third-party integrations whenever you choose.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Contact Us</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at support@deemeet.in.
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

export default PrivacyPolicyPage;
