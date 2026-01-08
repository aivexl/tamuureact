import { m } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    image?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    image = "/images/hero-bride.webp"
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A1128] flex overflow-hidden">
            {/* Left Pane: Immersive Visual (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[60%] relative items-center justify-center overflow-hidden">
                {/* Dynamic Multi-layered Overlay for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1128]/95 via-[#0A1128]/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/80 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,0,0,0.4),transparent_70%)] z-10" />

                <m.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={image}
                    alt="Tamuu Premium Authentication"
                    className="absolute inset-0 w-full h-full object-cover object-center grayscale-[15%] contrast-[105%]"
                />

                {/* Floating Brand Content */}
                <div className="relative z-20 text-white p-16 max-w-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <Link to="/" className="flex items-center gap-4 mb-40 group">
                            <div className="w-12 h-12 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-rose-500/40 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /></svg>
                            </div>
                            <span className="text-3xl font-black tracking-tighter">Tamuu</span>
                        </Link>

                        <h1 className="text-6xl font-black leading-[0.9] mb-8 tracking-tighter">
                            Tingkatkan <br />
                            <span className="text-premium-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Momen Spesial</span> <br />
                            Anda.
                        </h1>
                        <p className="text-xl text-white/80 font-semibold leading-relaxed max-w-md drop-shadow-md">
                            Bergabunglah dengan ribuan pasangan yang telah menciptakan undangan digital paling eksklusif di dunia.
                        </p>
                    </m.div>
                </div>

                {/* Glassmorphism Bottom Card */}
                <div className="absolute bottom-12 left-16 z-20">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6 max-w-xs shadow-2xl">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden bg-slate-800">
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-white/80">
                            <span className="text-teal-400">10k+</span> Pasangan Bahagia
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Pane: Action Area */}
            <div className="w-full lg:w-[40%] bg-[#0A1128] relative flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
                {/* Premium Back Button */}
                <div className="absolute top-10 right-8 lg:left-20 lg:right-auto z-30">
                    <m.button
                        whileHover={{ x: -4, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:text-premium-accent transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-widest">Kembali</span>
                    </m.button>
                </div>

                {/* Mobile Header (Only visible on small screens) */}
                <div className="lg:hidden absolute top-12 left-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /></svg>
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter">Tamuu</span>
                    </Link>
                </div>

                <m.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-sm mx-auto"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">{title}</h2>
                        <p className="text-white/50 text-base font-medium leading-relaxed">{subtitle}</p>
                    </div>

                    <div className="space-y-6">
                        {children}
                    </div>

                    <div className="mt-12 text-center text-xs text-white/20 font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Tamuu Platform &bull; Made with Love
                    </div>
                </m.div>
            </div>
        </div>
    );
};
