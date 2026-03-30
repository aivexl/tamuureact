"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Instagram, Twitter, MessageSquare, CheckCircle2, ChevronDown } from 'lucide-react';

export default function SupportPage() {
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct mailto URL
        const mailtoRecipient = 'cs@tamuu.id';
        const mailtoSubject = encodeURIComponent(`Contact: ${formData.subject} - from ${formData.fullName}`);
        const mailtoBody = encodeURIComponent(
            `Name: ${formData.fullName}\n` +
            `Email: ${formData.email}\n` +
            `Subject: ${formData.subject}\n\n` +
            `Message:\n${formData.message}`
        );

        const mailtoUrl = `mailto:${mailtoRecipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

        // Trigger email client
        window.location.href = mailtoUrl;

        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-[140px] md:pt-[130px] pb-20 px-6 sm:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 mb-6"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Connect with Us</span>
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">Get in Touch</h1>
                    <p className="text-sm sm:text-base text-slate-500 font-bold max-w-2xl mx-auto">
                        Whether you're planning a grand wedding or a corporate gala,
                        our elite support team is ready to assist you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8 uppercase">Official Channels</h2>

                            <div className="space-y-6">
                                <div className="flex gap-4 sm:gap-6 items-start group">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="pt-1.5 sm:pt-2">
                                        <h4 className="font-black text-slate-900 uppercase text-[9px] sm:text-xs tracking-widest mb-1">Email Support</h4>
                                        <p className="text-base sm:text-lg text-slate-600 font-bold">cs@tamuu.id</p>
                                    </div>
                                </div>


                                <div className="flex gap-4 sm:gap-6 items-start group">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="pt-1.5 sm:pt-2">
                                        <h4 className="font-black text-slate-900 uppercase text-[9px] sm:text-xs tracking-widest mb-1">Headquarters</h4>
                                        <p className="text-base sm:text-lg text-slate-600 font-bold leading-tight sm:leading-normal">BSD, Tangerang, Banten, Indonesia</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <h4 className="font-black text-slate-400 uppercase text-[9px] sm:text-[10px] tracking-[0.3em] mb-4 text-center sm:text-left">Follow Our Progress</h4>
                                <div className="flex justify-center sm:justify-start gap-4">
                                    <button className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                                        <Instagram className="w-5 h-5" />
                                    </button>
                                    <button className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                                        <Twitter className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Contact Form */}
                    <div className="bg-slate-900 p-8 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -mr-32 -mt-32" />

                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8 uppercase relative z-10">Direct Message</h2>

                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center text-center space-y-4"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Message Sent!</h3>
                                <p className="text-sm sm:text-base text-white/60 font-bold max-w-xs mx-auto">
                                    Thank you for reaching out. Linda will get back to you shortly.
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-indigo-400 font-black uppercase text-[10px] sm:text-xs tracking-widest hover:text-indigo-300 transition-colors pt-4"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-widest ml-4">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm sm:text-base"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-widest ml-4">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm sm:text-base"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-widest ml-4">Subject</label>
                                    <div className="relative">
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer text-sm sm:text-base"
                                        >
                                            <option className="bg-slate-950">General Inquiry</option>
                                            <option className="bg-slate-950">Partnership</option>
                                            <option className="bg-slate-950">Technical Support</option>
                                            <option className="bg-slate-950">Billing Issue</option>
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-widest ml-4">Message</label>
                                    <textarea
                                        required
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none text-sm sm:text-base"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <button type="submit" className="w-full bg-white text-slate-950 font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-xl group uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                                    Send Message
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
