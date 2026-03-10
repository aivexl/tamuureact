import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Package, AlertCircle, HelpCircle, CheckCircle, XCircle } from 'lucide-react';

export const RefundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white pt-[140px] md:pt-[130px] pb-20 px-6 sm:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 mb-6"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Satisfaction Guarantee</span>
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">Refund & Cancellation</h1>
                    <p className="text-sm sm:text-base text-slate-500 font-bold">Last updated: January 22, 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-orange max-w-none space-y-10 sm:space-y-12 text-slate-600 leading-relaxed font-outfit text-sm sm:text-base">
                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                            1. Digital Products Policy
                        </h2>
                        <p>
                            Tamuu provides digital invitations and software-as-a-service (SaaS) subscriptions. Due to the nature of digital products, once a service is consumed, themes applied, or premium assets unlocked, it is considered consumed.
                        </p>
                    </section>

                    <section className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-slate-100">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                            2. Refund Eligibility
                        </h2>
                        <p className="mb-6">We offer refunds under these specific conditions:</p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                <span><strong>Technical Failure:</strong> System downtime exceeding 48 hours.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                <span><strong>Duplicate Charge:</strong> Accidental double transactions.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                            3. Non-Refundable Items
                        </h2>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>Change of mind after template export or sharing.</li>
                            <li>Content mistakes by the user (typos, wrong dates).</li>
                            <li>Invitations already distributed to guests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                            4. How to Request
                        </h2>
                        <p>
                            Contact our support team at <strong>cs@tamuu.id</strong> with your Transaction ID. Requests are evaluated within 3-5 business days.
                        </p>
                    </section>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase tracking-tight text-center">© {new Date().getFullYear()} TAMUU CUSTOMER SUCCESS.</p>
                    <div className="flex gap-6 sm:gap-8">
                        <button className="text-[10px] sm:text-sm text-orange-600 font-black uppercase tracking-widest hover:underline">Contact Support</button>
                        <button className="text-[10px] sm:text-sm text-orange-600 font-black uppercase tracking-widest hover:underline">Billing Portal</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPage;