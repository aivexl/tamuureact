import React from 'react';
import { Metadata } from 'next';
import { Shield, Lock, Eye, Database, Server, UserCheck, Smartphone, Globe } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy | Tamuu',
    description: 'Pelajari bagaimana Tamuu melindungi data pribadi dan privasi Anda dalam menggunakan platform undangan digital kami.',
};

export default function PrivacyContent() {
    return (
        <div className="min-h-screen bg-slate-50 pt-[140px] md:pt-[130px] pb-20 px-6 sm:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-600 mb-6">
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Privacy Protection</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">Privacy Policy</h1>
                    <p className="text-sm sm:text-base text-slate-500 font-bold">Last updated: January 22, 2026</p>
                </div>

                {/* Content Cards */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                            1. Information Collection
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                            Your information is safe with us. Tamuu understands that privacy concerns are extremely important to our customers. You can rest assured that any information you submit to us will not be misused, abused or sold to any other parties. We only use your personal information to complete your order and provide our services.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-slate-600">
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight text-xs sm:text-sm">Account Data</h4>
                                <p className="text-xs sm:text-sm leading-relaxed">We store your name, email address, and profile details provided during registration to maintain your subscription and identity.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight text-xs sm:text-sm">Financial Data</h4>
                                <p className="text-xs sm:text-sm leading-relaxed">Payment processing is handled securely via Midtrans. We do not store your full credit card details on our servers.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Server className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                            2. Security Measures
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Tamuu shall take all reasonable steps to prevent security breaches in its servers' interaction with you and security breaches in the interaction with resources or users outside of any firewall that may be built into the Tamuu servers. We implement multi-layer SSL/TLS encryption and regular security audits to ensure data integrity.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                            3. Data Storage
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Your invitation content (images, text) is stored in high-performance Cloudflare R2 object storage. SQL data is stored in localized Cloudflare D1 databases. We ensure that Personally Identifiable Information (PII) is handled in accordance with international data protection standards.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                            4. Applicable Laws
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            These Terms and Conditions and our Privacy Policy are governed by the law in force in Indonesia. We comply with all local regulations regarding electronic transactions and data privacy.
                        </p>
                    </div>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10">
                    <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-tight text-center">© {new Date().getFullYear()} TAMUU SECURITY LAB.</p>
                    <div className="flex gap-6 sm:gap-8">
                        <button className="text-[10px] sm:text-xs text-slate-500 font-black uppercase tracking-widest hover:text-indigo-600">Cookie Policy</button>
                        <button className="text-[10px] sm:text-xs text-slate-500 font-black uppercase tracking-widest hover:text-indigo-600">Compliance</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
