import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

// ============================================
// FAQ DATA
// ============================================
const FAQ_ITEMS = [
    {
        q: 'Apa itu Tamuu?',
        a: 'Tamuu adalah platform undangan digital premium yang memungkinkan Anda membuat undangan interaktif untuk berbagai acara seperti pernikahan, ulang tahun, aqiqah, dan lainnya dengan desain eksklusif dan fitur canggih.'
    },
    {
        q: 'Apakah bisa digunakan gratis?',
        a: 'Ya! Kami menyediakan paket gratis dengan akses ke template dasar dan 1 undangan aktif. Untuk fitur premium seperti musik kustom, ekspor video, dan template eksklusif, Anda bisa upgrade ke paket VIP atau VVIP.'
    },
    {
        q: 'Bagaimana cara membagikan undangan ke tamu?',
        a: 'Setiap undangan memiliki link unik (contoh: tamuu.id/andi-sarah) yang bisa langsung dibagikan via WhatsApp, Instagram, atau platform lainnya. Anda juga bisa generate QR Code personal untuk setiap tamu.'
    },
    {
        q: 'Apakah tamu bisa RSVP dan kirim ucapan?',
        a: 'Tentu! Setiap undangan dilengkapi fitur RSVP untuk konfirmasi kehadiran dan kolom ucapan/wishes yang bisa dilihat langsung oleh Anda sebagai penyelenggara.'
    },
    {
        q: 'Bisakah undangan ditampilkan di TV/layar besar?',
        a: 'Bisa! Kami menyediakan Display Editor khusus dengan resolusi landscape (1920x1080) yang optimal untuk ditampilkan di TV atau proyektor saat acara berlangsung.'
    },
    {
        q: 'Apakah data saya aman?',
        a: 'Keamanan adalah prioritas kami. Data Anda tersimpan di infrastruktur Cloudflare yang terenkripsi dan terproteksi. Kami tidak pernah membagikan data pribadi Anda kepada pihak ketiga.'
    },
];

// ============================================
// ACCORDION ITEM COMPONENT
// ============================================
const AccordionItem: React.FC<{ item: typeof FAQ_ITEMS[0]; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between py-6 text-left group"
            >
                <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                    {item.q}
                </span>
                <span className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-600 leading-relaxed pr-12">
                            {item.a}
                        </p>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================
// MAIN FAQ SECTION COMPONENT
// ============================================
const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

    return (
        <section id="faq" className="py-24 md:py-32 bg-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
                        </svg>
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Pertanyaan yang Sering Ditanyakan
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Temukan jawaban untuk pertanyaan umum seputar Tamuu.
                    </p>
                </div>

                {/* Accordion */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-6 md:p-10">
                    {FAQ_ITEMS.map((item, index) => (
                        <AccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
