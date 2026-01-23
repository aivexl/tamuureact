import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';
import { usePayment } from '../hooks/usePayment';

interface TierCardProps {
    name: string;
    price: string;
    originalPrice?: string;
    duration: string;
    features: string[];
    isPopular?: boolean;
    isCurrent?: boolean;
    icon: React.ElementType;
    color: string;
    buttonText: string;
    onSelect: () => void;
    isLoading?: boolean;
}

const TierCard: React.FC<TierCardProps> = ({
    name,
    price,
    originalPrice,
    duration,
    features,
    isPopular,
    isCurrent,
    icon: Icon,
    color,
    buttonText,
    onSelect,
    isLoading
}) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`relative p-8 rounded-3xl border ${isPopular
            ? 'bg-white border-[#FFBF00] shadow-[0_20px_50px_rgba(255,191,0,0.15)] z-10'
            : 'bg-white/50 border-white/20 backdrop-blur-xl'
            } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
    >
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFBF00] text-[#0A1128] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Recommended
            </div>
        )}

        {isCurrent && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Current Plan
            </div>
        )}

        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-2xl font-black text-[#0A1128] mb-2">{name}</h3>
        <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-[#0A1128]">{price}</span>
            <span className="text-slate-400 text-sm font-medium">/{duration}</span>
        </div>
        {originalPrice && (
            <span className="text-slate-400 line-through text-sm font-medium mb-6 block">
                Regular {originalPrice}
            </span>
        )}

        <div className="space-y-4 mb-8 mt-6">
            {features.map((feature, i) => (
                <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600 text-sm leading-tight">{feature}</span>
                </div>
            ))}
        </div>

        <button
            onClick={onSelect}
            disabled={isCurrent || isLoading}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${isCurrent
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isPopular
                    ? 'bg-[#FFBF00] text-[#0A1128] hover:shadow-[0_10px_20px_rgba(255,191,0,0.3)]'
                    : 'bg-[#0A1128] text-white hover:bg-[#152042]'
                } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
        >
            {isLoading ? 'Processing...' : buttonText}
            {!isCurrent && !isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
    </motion.div>
);

export const UpgradePage: React.FC = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const { initiatePayment, processingTier } = usePayment();

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-[#0A1128] mb-6 leading-tight"
                    >
                        Elevate Your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FF8C00]">
                            Celebration
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg max-w-2xl mx-auto"
                    >
                        Choose the perfect plan to make your invitation unforgettable.
                        Unlock premium themes, video exports, and VIP support.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
                    {/* Free Tier */}
                    <TierCard
                        name="Free"
                        price="Rp 0"
                        duration="Forever"
                        icon={Zap}
                        color="bg-slate-400"
                        isCurrent={user?.tier === 'free'}
                        features={[
                            "1 Active Invitation",
                            "Basic Templates Only",
                            "Digital Guestbook (Basic)",
                            "WhatsApp Integration",
                            "1 Month Online Access"
                        ]}
                        buttonText={user?.tier === 'free' ? "Current Plan" : "Get Started"}
                        onSelect={() => navigate('/dashboard')}
                        isLoading={processingTier === 'free'}
                    />

                    {/* VIP Tier */}
                    <TierCard
                        name="VIP PREMIERE"
                        price="Rp 99k"
                        originalPrice="Rp 149k"
                        duration="per year"
                        icon={Crown}
                        color="bg-indigo-600"
                        isPopular={true}
                        isCurrent={user?.tier === 'vip'}
                        features={[
                            "1 Active Invitation",
                            "VIP & Basic Templates",
                            "Full HD PDF Export",
                            "Remove Tamuu Branding",
                            "RSVP Management",
                            "1 Year Online Access",
                            "Priority Support"
                        ]}
                        buttonText={user?.tier === 'vip' ? "Active" : "Go VIP PREMIERE"}
                        onSelect={() => initiatePayment('vip')}
                        isLoading={processingTier === 'vip'}
                    />

                    {/* VVIP Tier */}
                    <TierCard
                        name="VVIP EXCLUSIVE"
                        price="Rp 199k"
                        originalPrice="Rp 299k"
                        duration="per year"
                        icon={Star}
                        color="bg-[#FFBF00]"
                        isCurrent={user?.tier === 'vvip'}
                        features={[
                            "3 Active Invitations",
                            "All Templates (All access)",
                            "Video Invitation Export",
                            "Custom Music Upload",
                            "White-label (No Branding)",
                            "1 Year Online Access",
                            "Concierge Setup Service"
                        ]}
                        buttonText={user?.tier === 'vvip' ? "Active" : "Go VVIP EXCLUSIVE"}
                        onSelect={() => initiatePayment('vvip')}
                        isLoading={processingTier === 'vvip'}
                    />
                </div>


                {/* Payment Methods Visuals */}
                <div className="mt-24 mb-12 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Secure Payment Powered by Midtrans</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {["BNI", "CIMB", "ShopeePay", "Permata", "BRI", "QRIS", "BSI", "GoPay", "Mandiri", "DANA"].map(logo => (
                            <span key={logo} className="text-lg font-black text-slate-800 tracking-tighter">{logo}</span>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-8 rounded-3xl bg-[#0A1128] text-white overflow-hidden relative"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-black mb-2">Need a custom solution?</h2>
                            <p className="text-white/60">We offer special packages for wedding organizers and agencies.</p>
                        </div>
                        <Link
                            to="/contact"
                            className="bg-white text-[#0A1128] px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors shrink-0"
                        >
                            Contact Sales
                        </Link>
                    </div>
                    {/* Abstract background blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFBF00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </motion.div>
            </div>
        </div>
    );
};
