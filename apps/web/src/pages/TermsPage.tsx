import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, Globe, CreditCard, Lock, UserCheck, AlertTriangle } from 'lucide-react';

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
                        <span className="text-xs font-black uppercase tracking-widest">Legal Agreement</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">Terms & Conditions</h1>
                    <p className="text-slate-500 font-bold">Last updated: January 22, 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-indigo max-w-none space-y-12 text-slate-600 leading-relaxed font-outfit">
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Globe className="w-6 h-6 text-indigo-500" />
                            1. Conditions of Use
                        </h2>
                        <p>
                            Tamuu is offered to you, the user, conditioned on your acceptance of the terms, conditions, and notices contained or incorporated by reference herein and such additional terms and conditions, agreements, and notices that may apply to any page or section of the Site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <FileText className="w-6 h-6 text-indigo-500" />
                            2. Overview
                        </h2>
                        <p>
                            Your use of this Site constitutes your agreement to all terms, conditions and notices. Please read them carefully. By using this Site, you agree to these Terms and Conditions, as well as any other terms, guidelines or rules that are applicable to any portion of this Site, without limitation or qualification. If you do not agree to these Terms and Conditions, you must exit the Site immediately and discontinue any use of information or products from this Site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Scale className="w-6 h-6 text-indigo-500" />
                            3. Modification of the Site and These Terms & Conditions
                        </h2>
                        <p>
                            Tamuu reserves the right to change, modify, alter, update or discontinue the terms, conditions, and notices under which this Site is offered and the links, content, information, prices and any other materials offered via this Site at any time and from time to time without notice or further obligation to you except as may be provided therein. We have the right to adjust prices from time to time. If for some reason there may have been a price mistake, Tamuu has the right to refuse the order. By your continued use of the Site following such modifications, alterations, or updates you agree to be bound by such modifications, alterations, or updates.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Lock className="w-6 h-6 text-indigo-500" />
                            4. Grant of License
                        </h2>
                        <p>
                            Tamuu grants you the right to access and use the Licensed Software Platform solely for your internal business purposes for the duration of this Agreement. This right is non-exclusive, non-transferable, and limited by and subject to this Agreement. You may not: (a) modify, adapt, decompile, disassemble, or reverse engineer any component of the Licensed Software Platform; (b) create derivative works based on any component of the Licensed Software Platform; (c) allow any third party to use or have access to any component of the Licensed Software Platform or Documentation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Shield className="w-6 h-6 text-indigo-500" />
                            5. Proprietary Rights
                        </h2>
                        <p>
                            You acknowledge and agree that: (a) the Licensed Software Platform and Documentation are the property of Tamuu or its licensors and not Yours, and (b) You will use the Licensed Software Platform and Documentation only under the terms and conditions described herein.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <CreditCard className="w-6 h-6 text-indigo-500" />
                            6. Fees
                        </h2>
                        <p>
                            In consideration for the license granted, you shall pay to Tamuu the license fee as set out in the fee schedule on the Pricing page of the Site. The License Fee is exclusive of VAT and shall be invoiced and billed to the Licensee's credit card details or preferred payment method.
                        </p>
                        <p className="mt-4 text-sm italic opacity-80">
                            Note: When you choose to upgrade to a paid subscription, any remaining trial period will naturally conclude as your new premium benefits and extended validity period begin immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <UserCheck className="w-6 h-6 text-indigo-500" />
                            7. Eligibility
                        </h2>
                        <p>
                            These Terms and Conditions cover either i) usage to evaluate the Licensed Software Platform, including via prototypes made available on Preview, or ii) usage by smaller independent developers, students, academic staff or hobbyists. All other uses are subject to a separate commercial agreement with Tamuu.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <AlertTriangle className="w-6 h-6 text-indigo-500" />
                            8. Terms of Termination
                        </h2>
                        <p>
                            Tamuu, at its sole discretion, may suspend or terminate this Agreement with immediate effect if:
                        </p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>Tamuu suspects that you are endangering the License Software Platform; or</li>
                            <li>You commit any material breach of your obligations under this Agreement; or</li>
                            <li>You cease to carry on business or become unable to pay your debts; or</li>
                            <li>You have or may become incapable of performing Your obligations under this Agreement.</li>
                        </ul>
                    </section>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">© {new Date().getFullYear()} TAMUU.ID. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-6">
                        <button className="text-sm text-indigo-600 font-black uppercase tracking-widest hover:underline">cs@tamuu.id</button>
                        <button className="text-sm text-indigo-600 font-black uppercase tracking-widest hover:underline">Legal</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
