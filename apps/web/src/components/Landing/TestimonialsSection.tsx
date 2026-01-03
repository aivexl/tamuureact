import React from 'react';
import { m } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Rina Santika",
        role: "Pasangan Pengantin",
        content: "Undangan digital dari Tamuu benar-benar memukau! Tamu-tamu kami kagum dengan desainnya yang elegan. Fitur RSVP sangat membantu kami menghitung jumlah tamu dengan akurat.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&auto=format&fit=crop&crop=face&q=60",
        rating: 5
    },
    {
        name: "Dewi Anggraini",
        role: "Calon Pengantin Wanita",
        content: "Awalnya ragu pakai undangan digital, tapi setelah lihat hasilnya, saya sangat puas! Tamu-tamu langsung bisa konfirmasi kehadiran dan kirim ucapan. Praktis sekali!",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&auto=format&fit=crop&crop=face&q=60",
        rating: 5
    },
    {
        name: "Budi Santoso",
        role: "Calon Pengantin Pria",
        content: "Proses pembuatan undangan sangat mudah, cukup dari HP saja. Tema-temanya premium dan modern. Sangat membantu untuk persiapan pernikahan kami yang mendadak.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&auto=format&fit=crop&crop=face&q=60",
        rating: 5
    },
    {
        name: "Siti Aminah",
        role: "Ibu Mempelai",
        content: "Fitur WhatsApp broadcast sangat membantu! Saya bisa kirim undangan ke keluarga besar dalam sekali klik. Hemat waktu dan tidak perlu repot antar undangan fisik.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&auto=format&fit=crop&crop=face&q=60",
        rating: 5
    },
    {
        name: "Hendra Wijaya",
        role: "Ayah Mempelai",
        content: "Untuk acara syukuran keluarga, Tamuu memberikan solusi undangan yang modern. Musik latar dan animasinya membuat undangan terasa hidup dan sangat eksklusif.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&auto=format&fit=crop&crop=face&q=60",
        rating: 5
    },
    {
        name: "Maya Putri",
        role: "Calon Pengantin Wanita",
        content: "Dashboard analitik tamu sangat membantu koordinasi dengan vendor catering. Kami tahu persis berapa tamu yang akan hadir. Acara jadi lebih terorganisir!",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&auto=format&fit=crop&crop=face&q=60",
        rating: 5
    }
];

const TestimonialsSection: React.FC = () => {
    return (
        <section id="testimonials" className="py-32 px-6 overflow-hidden relative" style={{ backgroundColor: '#0A1128' }}>
            {/* Decorative Glows - Same as Hero */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
                <m.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[#FFBF00] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FFBF00]/20"
                >
                    <Star className="w-3 h-3 fill-[#FFBF00]" />
                    <span>Kesan Pelanggan</span>
                </m.div>
                <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white leading-tight">Apa Kata <br /><span className="text-[#FFBF00]">Mempelai Tamuu</span></h2>
                <p className="text-white/70 max-w-xl mx-auto font-medium text-lg">Dengarkan kebahagiaan mereka yang telah mempercayakan momen spesial kepada layanan kami.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
                {testimonials.map((t, i) => (
                    <m.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 flex flex-col hover:bg-white/[0.08] transition-all group"
                    >
                        <div className="flex gap-1 mb-6">
                            {[...Array(t.rating)].map((_, starI) => (
                                <Star key={starI} className="w-4 h-4 fill-[#FFBF00] text-[#FFBF00]" />
                            ))}
                        </div>
                        <blockquote className="text-white/80 font-medium leading-relaxed mb-10 flex-1 italic text-lg">
                            "{t.content}"
                        </blockquote>
                        <div className="flex items-center gap-4 border-t border-white/10 pt-8 mt-auto">
                            <img
                                src={t.avatar}
                                alt={t.name}
                                width={48}
                                height={48}
                                loading="lazy"
                                className="w-12 h-12 rounded-full ring-2 ring-[#FFBF00]/30"
                            />
                            <div className="text-left">
                                <p className="font-bold text-white group-hover:text-[#FFBF00] transition-colors">{t.name}</p>
                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">{t.role}</p>
                            </div>
                        </div>
                    </m.div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
