import { m } from 'framer-motion';
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react';
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
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Mulai buat undangan impian Anda sekarang.</h2>
                <div className="w-20 h-1.5 bg-[#FFBF00] mx-auto rounded-full" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch max-w-lg md:max-w-none mx-auto">
                {pricingPlans.map((plan, index) => {
                    const isCurrent = user?.tier === plan.tier;
                    const isLoading = processingTier === plan.tier;
                    const Icon = plan.icon;

                    return (
                        <m.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className={`relative p-8 rounded-3xl border transition-all duration-300 ${plan.popular
                                ? 'bg-white border-[#FFBF00] shadow-[0_20px_50px_rgba(255,191,0,0.15)] z-10'
                                : 'bg-white/50 border-white/20 backdrop-blur-xl border-slate-200'
                                } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFBF00] text-[#0A1128] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                                    Recommended
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                                    Current Plan
                                </div>
                            )}

                            <h3 className="text-2xl font-black text-[#0A1128] mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-4xl font-black text-[#0A1128] tracking-tighter">{plan.price}</span>
                                <span className="text-slate-400 text-sm font-medium">/{plan.duration}</span>
                            </div>
                            {plan.originalPrice && (
                                <span className="text-slate-400 line-through text-sm font-medium mb-6 block">
                                    Regular {plan.originalPrice}
                                </span>
                            )}

                            <div className="space-y-4 mb-8 mt-6">
                                {plan.features.map((feature, i) => (
                                    <div key={feature} className="flex items-start gap-3">
                                        <div className="mt-1 bg-emerald-100 rounded-full p-0.5 flex-shrink-0">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        </div>
                                        <span className="text-slate-600 text-sm leading-tight font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleAction(plan.tier)}
                                disabled={isCurrent || isLoading}
                                className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${isCurrent
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : plan.popular
                                        ? 'bg-[#FFBF00] text-[#0A1128] hover:shadow-[0_10px_20px_rgba(255,191,0,0.3)]'
                                        : 'bg-[#0A1128] text-white hover:bg-[#152042]'
                                    } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isLoading ? 'Processing...' : (isCurrent ? 'Current Plan' : (plan.tier === 'free' ? 'Get Started' : `Go ${plan.name.charAt(0) + plan.name.slice(1).toLowerCase()}`))}
                                {!isCurrent && !isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </m.div>
                    );
                })}
            </div>

            <div className="mt-24 mb-12 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Pilihan Metode Pembayaran</p>
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 max-w-4xl mx-auto">
                    {["BNI", "CIMB", "ShopeePay", "Permata", "BRI", "QRIS", "BSI", "GoPay", "Mandiri", "DANA"].map(logo => (
                        <span key={logo} className="text-lg font-black text-slate-800 tracking-tighter whitespace-nowrap">{logo}</span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
