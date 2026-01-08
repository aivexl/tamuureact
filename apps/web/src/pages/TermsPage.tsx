import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, Globe } from 'lucide-react';

export const TermsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 mb-6"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Legal Fortress</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-slate-500 font-medium">Last updated: January 9, 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-indigo max-w-none space-y-12 text-slate-600 leading-relaxed font-outfit">
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                            <Globe className="w-6 h-6 text-indigo-500" />
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using the Tamuu platform ("Tamuu", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. Tamuu is a product of high-end digital invitation engineering intended for global enterprise use.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                            <Scale className="w-6 h-6 text-indigo-500" />
                            2. User Responsibilities
                        </h2>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>You must be at least 18 years old to create an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You agree not to use the platform for any unlawful activities or to distribute malicious content.</li>
                            <li>You represent that all content (images, text) uploaded to your invitations belongs to you or you have the necessary licenses.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                            <FileText className="w-6 h-6 text-indigo-500" />
                            3. Subscription and Billing
                        </h2>
                        <p>
                            Tamuu offers various subscription tiers (Free, VIP, VVIP). By upgrading, you agree to pay the specified fees. All payments are processed via Xendit. Refund policies are subject to Indonesian consumer protection laws and are handled on a case-by-case basis through our priority support channel.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                            <Shield className="w-6 h-6 text-indigo-500" />
                            4. Intellectual Property
                        </h2>
                        <p>
                            The Tamuu editor, design engine, and proprietary templates are the intellectual property of Tamuu. You are granted a limited license to create and share invitations. You may not reverse-engineer, scrape, or attempt to clone the platform's core architecture.
                        </p>
                    </section>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-400 font-medium italic">© 2026 Tamuu Elite Platform. All rights reserved.</p>
                    <div className="flex gap-6">
                        <button className="text-sm text-indigo-600 font-bold hover:underline">Support Center</button>
                        <button className="text-sm text-indigo-600 font-bold hover:underline">Contact Legal</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
