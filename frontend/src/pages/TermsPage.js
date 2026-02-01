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

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Agreement to Terms</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and DeeMeet ("we," "us," or "our"), concerning your access to and use of the DeeMeet website and application (the "Service"). By accessing or using the Service, you agree that you have read, understood, and accept all of these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the Service and must discontinue use immediately.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Intellectual Property Rights</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Unless otherwise indicated, the Service is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Service (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        The Content and the Marks are provided on the Service "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Service, no part of the Service and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. User Representations</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        By using the Service, you represent and warrant that:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li>All registration information you submit will be true, accurate, current, and complete.</li>
                        <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                        <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                        <li>You are not a minor in the jurisdiction in which you reside.</li>
                        <li>You will not access the Service through automated or non-human means, whether through a bot, script or otherwise.</li>
                        <li>You will not use the Service for any illegal or unauthorized purpose.</li>
                        <li>Your use of the Service will not violate any applicable law or regulation.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Prohibited Activities</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        As a user of the Service, you agree not to:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li>Systematically retrieve data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                        <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                        <li>Circumvent, disable, or otherwise interfere with security-related features of the Service.</li>
                        <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Service.</li>
                        <li>Use any information obtained from the Service in order to harass, abuse, or harm another person.</li>
                        <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                        <li>Use the Service in a manner inconsistent with any applicable laws or regulations.</li>
                        <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party's uninterrupted use and enjoyment of the Service.</li>
                        <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Service to you.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. User Generated Contributions</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        The Service may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Service, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Contributions may be viewable by other users of the Service and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-8 space-y-2">
                        <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</li>
                        <li>Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
                        <li>Your Contributions do not advocate the violent overthrow of any government or incite, encourage, or threaten physical harm against another.</li>
                        <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
                        <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
                        <li>Your Contributions do not contain any material that solicits personal information from anyone under the age of 18 or exploits people under the age of 18 in a sexual or violent manner.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Contribution License</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        By posting your Contributions to any part of the Service, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Submissions</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or other information regarding the Service ("Submissions") provided by you to us are non-confidential and shall become our sole property. We shall own exclusive rights, including all intellectual property rights, and shall be entitled to the unrestricted use and dissemination of these Submissions for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Site Management</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We reserve the right, but not the obligation, to: (1) monitor the Service for violations of these Terms of Service; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Service; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; and (4) otherwise manage the Service in a manner designed to protect our rights and property and to facilitate the proper functioning of the Service.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Term and Termination</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        These Terms of Service shall remain in full force and effect while you use the Service. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF SERVICE OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICE OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Modifications and Interruptions</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        We reserve the right to change, modify, or remove the contents of the Service at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the Service without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Service.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Governing Law</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        These Terms shall be governed by and defined following the laws of India. DeeMeet and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Contact Us</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        In order to resolve a complaint regarding the Service or to receive further information regarding use of the Service, please contact us at:
                    </p>
                    <p className="text-slate-900 dark:text-white font-semibold">
                        DeeMeet
                        <br />
                        support@deemeet.in
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
