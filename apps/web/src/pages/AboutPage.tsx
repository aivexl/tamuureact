import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Globe, Zap, ShieldCheck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-amber-400 mb-6 backdrop-blur-md border border-white/10"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Our Story</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                        Redefining Digital <br className="hidden md:block" /> Invitation <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Engineering</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed">
                        Based in BSD, Tangerang, Tamuu is Indonesia's most advanced digital invitation platform,
                        where premium design meets world-class technology.
                    </p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Our Vision</h2>
                            <p className="text-lg text-slate-600 leading-relaxed font-outfit">
                                To become the global benchmark for high-fidelity digital events,
                                transforming every celebration into a cinematic and seamless experience
                                through innovative engineering and curated aesthetics.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Our Mission</h2>
                            <ul className="space-y-4">
                                {[
                                    { icon: Zap, text: "Empowering users with enterprise-grade editor performance." },
                                    { icon: ShieldCheck, text: "Ensuring top-tier data security and privacy for every guest." },
                                    { icon: Heart, text: "Delivering luxury as a service to make every invitation feel personal." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shrink-0">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <p className="text-slate-600 font-medium mt-2">{item.text}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl">
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-20">
                                <Users className="w-full h-full text-slate-300 stroke-[1px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-slate-50 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">The Tamuu Standard</h2>
                        <div className="w-20 h-1.5 bg-amber-400 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Innovation", desc: "We utilize cutting-edge cloud tech (Cloudflare Worker/D1/R2) for sub-second delivery." },
                            { title: "Craftsmanship", desc: "Every template is engineered, not just designed, for pixel-perfect responsiveness." },
                            { title: "Integrity", desc: "Transparency in billing and absolute respect for user data privacy." }
                        ].map((value, i) => (
                            <div key={i} className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{value.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
