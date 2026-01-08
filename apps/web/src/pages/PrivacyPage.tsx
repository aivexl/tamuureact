import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-600 mb-6"
                    >
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Privacy Fortress</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-slate-500 font-medium">Last updated: January 9, 2026</p>
                </div>

                {/* Content Cards */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Eye className="w-6 h-6 text-emerald-500" />
                            What We Collect
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600">
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2">Account Data</h4>
                                <p className="text-sm leading-relaxed">We store your name, email, and profile details provided during signup to maintain your identity and subscription state.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2">Invitation Content</h4>
                                <p className="text-sm leading-relaxed">Images, text, and music uploaded to invitations are stored securely in Cloudflare R2 for high-performance delivery.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Database className="w-6 h-6 text-emerald-500" />
                            Data Sovereignty
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Your data is stored in localized Cloudflare D1 databases. We do not sell your personal information or the data of your guests to third parties. Analytical data is anonymized and used exclusively to improve the platform's performance and design engine.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Shield className="w-6 h-6 text-emerald-500" />
                            Guest Privacy
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            RSVP data submitted by your guests (names, emails, attendance status) is accessible only to you and authorized system administrators. We implement SSL encryption and multi-layer security protocols to prevent unauthorized access.
                        </p>
                    </div>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-center gap-10">
                    <p className="text-sm text-slate-400 font-medium">© 2026 Tamuu Security Lab.</p>
                    <div className="flex gap-8">
                        <button className="text-xs text-slate-500 font-bold hover:text-indigo-600">Cookie Protocol</button>
                        <button className="text-xs text-slate-500 font-bold hover:text-indigo-600">GDPR Compliance</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
