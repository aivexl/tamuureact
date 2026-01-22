import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Package, AlertCircle, HelpCircle, CheckCircle, XCircle } from 'lucide-react';

export const RefundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 mb-6"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Satisfaction Guarantee</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">Refund & Cancellation</h1>
                    <p className="text-slate-500 font-bold">Last updated: January 22, 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-orange max-w-none space-y-12 text-slate-600 leading-relaxed font-outfit">
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Package className="w-6 h-6 text-orange-500" />
                            1. Digital Products Policy
                        </h2>
                        <p>
                            Tamuu provides digital invitations and software-as-a-service (SaaS) subscriptions. Due to the nature of digital products, once an invitation template is unlocked, a theme is applied, or a premium subscription is activated, the service is considered "consumed."
                        </p>
                    </section>

                    <section className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            2. Refund Eligibility
                        </h2>
                        <p className="mb-6">We offer partial or full refunds under the following specific circumstances:</p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                <span><strong>Technical Failure:</strong> If our platform experiences a catastrophic failure that prevents you from accessing or using your purchased invitation for more than 48 hours.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                <span><strong>Duplicate Charge:</strong> If you were accidentally charged twice for the same transaction.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                <span><strong>Unactivated Service:</strong> If you purchased a premium tier but have not yet logged in or "claimed" the premium assets within 24 hours of purchase.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <XCircle className="w-6 h-6 text-red-500" />
                            3. Non-Refundable Items
                        </h2>
                        <p className="mb-6">Refunds will <strong>not</strong> be granted for:</p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>Change of mind after a premium template has been exported or shared.</li>
                            <li>Mistakes made by the user in the content of the invitation (typos, incorrect dates, etc.).</li>
                            <li>Dissatisfaction with the design if it matches the preview shown before purchase.</li>
                            <li>Invitations that have already been sent out to guests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <AlertCircle className="w-6 h-6 text-orange-500" />
                            4. Cancellation Policy
                        </h2>
                        <p>
                            You may cancel your recurring subscription at any time via the <strong>Billing</strong> section in your dashboard. Upon cancellation, you will continue to have access to the premium features until the end of your current billing period. No further charges will be made.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <HelpCircle className="w-6 h-6 text-orange-500" />
                            5. How to Request a Refund
                        </h2>
                        <p>
                            To request a refund, please contact our support team at <strong>cs@tamuu.id</strong> with your Transaction ID and the reason for your request. All requests will be evaluated by our billing department within 3-5 business days. Approved refunds will be processed back to the original payment method.
                        </p>
                    </section>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">© {new Date().getFullYear()} TAMUU CUSTOMER SUCCESS.</p>
                    <div className="flex gap-6">
                        <button className="text-sm text-orange-600 font-black uppercase tracking-widest hover:underline">Contact Support</button>
                        <button className="text-sm text-orange-600 font-black uppercase tracking-widest hover:underline">Billing Portal</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
