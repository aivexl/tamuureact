import { motion } from 'framer-motion';
import { Check, Crown, Star, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { usePayment } from '../../hooks/usePayment';

const pricingPlans = [
    {
        tier: "free",
        name: "FREE",
        price: "Rp 0",
        duration: "selamanya",
        icon: Zap,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 30 Hari",
            "Template Dasar",
            "Buku Tamu Digital",
            "RSVP Dasar",
            "Watermark Tamuu",
        ],
    },
    {
        tier: "pro",
        name: "PRO",
        price: "Rp 99k",
        originalPrice: "Rp 149k",
        duration: "per tahun",
        icon: Crown,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 1 Tahun",
            "Semua Template Premium",
            "Orbit Dynamic Animations",
            "Premium Music Library",
            "Digital Gift & Angpao",
            "Smart WhatsApp Sharing",
        ],
    },
    {
        tier: "ultimate",
        name: "ULTIMATE",
        price: "Rp 149k",
        originalPrice: "Rp 249k",
        duration: "per tahun",
        icon: Star,
        popular: true,
        features: [
            "2 Undangan Aktif",
            "Semua Fitur Pro",
            "Sistem Check-in & Out",
            "QR Code per Tamu",
            "Lucky Draw / Undian",
            "Dashboard Analytics",
            "Social Media Management",
        ],
    },
    {
        tier: "elite",
        name: "ELITE",
        price: "Rp 199k",
        originalPrice: "Rp 299k",
        duration: "per tahun",
        icon: Crown,
        features: [
            "3 Undangan Aktif",
            "Semua Fitur Ultimate",
            "Advanced Import/Export",
            "Eksklusivitas Layanan",
        ],
    },
];

const PricingSection: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const { initiatePayment, processingTier } = usePayment();

    const handleAction = (tier: string) => {
        if (!user) {
            navigate('/signup');
            return;
        }

        if (tier === 'free') {
            navigate('/dashboard');
        } else {
            initiatePayment(tier);
        }
    };

    return (
        <section id="pricing" className="bg-[#F8FAFC] py-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header Block */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-amber-600 font-black uppercase tracking-widest text-[10px] bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                            Investasi Terbaik
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-[#0A1128] tracking-tight leading-tight"
                    >
                        Pilih Paket <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FF8C00]">
                            Kebahagiaan Anda
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 max-w-2xl mx-auto text-lg"
                    >
                        Hadirkan kesan eksklusif untuk setiap momen spesial dengan fitur digital invitation premium dari Tamuu.
                    </motion.p>
                </div>

                {/* Pricing Grid - 4 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start relative mb-20">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={plan.tier}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className={`relative p-8 rounded-3xl border transition-all duration-300 ${plan.popular
                                ? 'bg-white border-[#FFBF00] shadow-[0_20px_50px_rgba(255,191,0,0.15)] z-10'
                                : 'bg-white/70 border-white/50 backdrop-blur-xl shadow-sm hover:shadow-xl'
                                } ${user?.tier === plan.tier ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFBF00] text-[#0A1128] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Recommended
                                </div>
                            )}

                            {user?.tier === plan.tier && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Current Plan
                                </div>
                            )}

                            <h3 className="text-2xl font-black text-[#0A1128] mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-4xl font-black text-[#0A1128]">{plan.price}</span>
                                <span className="text-slate-400 text-sm font-medium">/{plan.duration}</span>
                            </div>
                            {plan.originalPrice && (
                                <span className="text-slate-400 line-through text-sm font-medium mb-6 block">
                                    Regular {plan.originalPrice}
                                </span>
                            )}
                            {!plan.originalPrice && (
                                <div className="h-[20px] mb-6 block" />
                            )}

                            <div className="space-y-4 mb-8 mt-6">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3 group">
                                        <div className={`mt-1 rounded-full p-0.5 transition-colors ${plan.popular ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-slate-600 text-sm leading-tight font-medium group-hover:text-slate-900 transition-colors">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleAction(plan.tier)}
                                disabled={user?.tier === plan.tier || processingTier === plan.tier}
                                className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${user?.tier === plan.tier
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : plan.popular
                                        ? 'bg-[#FFBF00] text-[#0A1128] hover:shadow-[0_10px_20px_rgba(255,191,0,0.3)] shadow-md'
                                        : 'bg-[#0A1128] text-white hover:bg-[#152042] shadow-md'
                                    } ${processingTier === plan.tier ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {processingTier === plan.tier ? 'Processing...' : (user?.tier === plan.tier ? 'Current Plan' : 'Pilih Sekarang')}
                                {user?.tier !== plan.tier && processingTier !== plan.tier && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Payment Methods Section - Sync with Upgrade Page but enhanced */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 mb-12 text-center"
                >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Pilihan Metode Pembayaran</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 max-w-4xl mx-auto">
                        {["BNI", "CIMB", "ShopeePay", "Permata", "BRI", "QRIS", "BSI", "GoPay", "Mandiri", "DANA"].map(logo => (
                            <span
                                key={logo}
                                className="text-xl font-black text-slate-800 tracking-tighter cursor-default hover:text-[#0A1128] transition-colors"
                            >
                                {logo}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Floating Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            </div>
        </section>
    );
};

export default PricingSection;
