import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
    return (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-[#0A1128] p-12 md:p-24 text-center overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1]">Siap Untuk Membuat Momen Tak Terlupakan?</h2>
                    <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto font-medium">Buat undangan premium Anda hari ini. Mulai gratis, tanpa kartu kredit.</p>
                    <Link
                        to="/editor"
                        className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-[#FFBF00] text-[#0A1128] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FFBF00]/20"
                    >
                        Daftar Sekarang <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
