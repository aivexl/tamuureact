import React from 'react';
import { Metadata } from 'next';
import { Shield, FileText, Scale, Globe, CreditCard, Lock, UserCheck, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms & Conditions | Tamuu',
    description: 'Syarat dan ketentuan penggunaan layanan Tamuu. Baca selengkapnya tentang hak dan kewajiban Anda sebagai pengguna.',
};

export default function TermsContent() {
    return (
        <div className="min-h-screen bg-white pt-[140px] md:pt-[130px] pb-20 px-6 sm:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 mb-6">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Legal Agreement</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">Terms & Conditions</h1>
                    <p className="text-sm sm:text-base text-slate-500 font-bold">Last updated: January 22, 2026</p>
                </div>

                {/* Content */}
                <div className="prose prose-indigo max-w-none space-y-10 sm:space-y-12 text-slate-600 leading-relaxed font-outfit text-sm sm:text-base">
                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            1. Conditions of Use
                        </h2>
                        <p>
                            Tamuu is offered to you, the user, conditioned on your acceptance of the terms, conditions, and notices contained or incorporated by reference herein and such additional terms and conditions, agreements, and notices that may apply to any page or section of the Site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            2. Overview
                        </h2>
                        <p>
                            Your use of this Site constitutes your agreement to all terms, conditions and notices. Please read them carefully. By using this Site, you agree to these Terms and Conditions, as well as any other terms, guidelines or rules that are applicable to any portion of this Site, without limitation or qualification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            3. Modification of the Site
                        </h2>
                        <p>
                            Tamuu reserves the right to change, modify, alter, update or discontinue the terms, conditions, and notices under which this Site is offered and the links, content, information, prices and any other materials offered via this Site at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            4. Grant of License
                        </h2>
                        <p>
                            Tamuu grants you the right to access and use the Licensed Software Platform solely for your internal business purposes for the duration of this Agreement. This right is non-exclusive, non-transferable, and limited by and subject to this Agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            5. Fees
                        </h2>
                        <p>
                            In consideration for the license granted, you shall pay to Tamuu the license fee as set out in the fee schedule on the Pricing page of the Site. The License Fee is exclusive of VAT and shall be invoiced and billed to the Licensee's preferred payment method.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            6. Refund & Cancellation Policy
                        </h2>
                        <div className="space-y-4 text-slate-600">
                            <p className="font-bold text-slate-900 text-base">
                                All transactions conducted on the Tamuu platform are final.
                            </p>
                            <p>
                                Tamuu does not provide refunds, credits, or exchanges for any purchases, including but not limited to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Subscription Tiers:</strong> Basic, Pro, Ultimate, and Elite plan purchases or upgrades.</li>
                                <li><strong>Ad Balance:</strong> All top-ups and credits added to the vendor's advertisement balance.</li>
                                <li><strong>Digital Assets:</strong> Any premium themes or features unlocked through the platform.</li>
                            </ul>
                            <p>
                                This "No Refund" policy is strictly enforced because digital resources, server infrastructure, and license allocations are provisioned instantly upon payment validation.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            7. Terms of Termination
                        </h2>
                        <p>
                            Tamuu, at its sole discretion, may suspend or terminate this Agreement with immediate effect if you commit any material breach of your obligations under this Agreement or cease to carry on business.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6 uppercase tracking-tight">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            8. Governmental Independence & Neutrality
                        </h2>
                        <p>
                            Tamuu operates as a strictly independent private entity. We do not participate in, collaborate with, or engage in any projects, procurement initiatives, or partnerships lead by the government of the Republic of Indonesia. Our services and platform are provided independently of any governmental affiliations or governmental commercial activities.
                        </p>
                    </section>
                </div>

                {/* Footer Legal */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase tracking-tight text-center">© {new Date().getFullYear()} TAMUU.ID. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-6 sm:gap-8">
                        <button className="text-[10px] sm:text-sm text-indigo-600 font-black uppercase tracking-widest hover:underline">cs@tamuu.id</button>
                        <button className="text-[10px] sm:text-sm text-indigo-600 font-black uppercase tracking-widest hover:underline">Legal</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
