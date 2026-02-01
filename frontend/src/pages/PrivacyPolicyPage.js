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
                        We collect personal information that you voluntarily provide to us when registering at the Services expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect can include the following:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li><strong>Personal Info Provided by You:</strong> We collect names; email addresses; passwords; contact preferences; contact or authentication data; and other similar information.</li>
                        <li><strong>Calendar Data:</strong> In order to provide our scheduling services, we may request access to your calendar (Google Calendar, Outlook, etc.). We use this access to check for conflicts and add events to your calendar. We store calendar events only as necessary to provide our service.</li>
                        <li><strong>Payment Data:</strong> We collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
                        <li><strong>Social Login Data:</strong> We provide you with the option to register using social media account details, like your Google, Facebook, or other social media account. If you choose to register in this way, we will collect the Information described in the section called "HOW DO WE HANDLE YOUR SOCIAL LOGINS" below.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. How We Use Information</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li><strong>To facilitate account creation and logon process:</strong> If you choose to link your account with us to a third party account (such as your Google or Facebook account), we use the information you allowed us to collect from those third parties to facilitate account creation and logon process for the performance of the contract.</li>
                        <li><strong>To send you marketing and promotional communications:</strong> We and/or our third party marketing partners may use the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences.</li>
                        <li><strong>To send administrative information to you:</strong> We may use your personal information to send you product, service and new feature information and/or information about changes to our terms, conditions, and policies.</li>
                        <li><strong>To fulfill and manage your orders:</strong> We may use your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Will Your Information be Shared with Anyone?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share data based on the following legal basis:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li><strong>Consent:</strong> We may process your data if you have given us specific consent to use your personal information in a specific purpose.</li>
                        <li><strong>Legitimate Interests:</strong> We may process your data when it is reasonably necessary to achieve our legitimate business interests.</li>
                        <li><strong>Performance of a Contract:</strong> Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract.</li>
                        <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. How Do We Handle Your Social Logins?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Our Services offer you the ability to register and login using your third party social media account details (like your Facebook or Twitter logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile Information we receive may vary depending on the social media provider concerned, but will often include your name, e-mail address, friends list, picture as well as other information you choose to make public.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We will use the information we receive only for the purposes that are described in this privacy policy or that are otherwise made clear to you on the Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third party social media provider. We recommend that you review their privacy policy to understand how they collect, use and share your personal information.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. How Long Do We Keep Your Information?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements). No purpose in this policy will require us keeping your personal information for longer than the period of time in which users have an account with us.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. How Do We Keep Your Information Safe?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the services within a secure environment.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Do We Collect Information from Minors?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. What Are Your Privacy Rights?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        In some regions, such as the European Economic Area, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        If you have questions or comments about your privacy rights, you may email us at support@deemeet.in.
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Account Information</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        If you would at any time like to review or change the information in your account or terminate your account, you can:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li>Log into your account settings and update your user account.</li>
                        <li>Contact us using the contact information provided.</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, some information may be retained in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our Terms of Use and/or comply with legal requirements.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Contact Us</h2>
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
