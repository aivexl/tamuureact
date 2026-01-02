import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Layout, Eye, ArrowRight, Scissors } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-12 pb-20 px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Logo / Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white shadow-xl flex items-center justify-center text-premium-accent">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Developer <span className="text-premium-accent">Dashboard</span>
                    </h1>
                    <p className="text-gray-400 mt-4 text-sm font-bold tracking-widest uppercase">
                        Tamuu Studio Engine
                    </p>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-lg text-gray-500 max-w-md mb-16 font-medium"
                >
                    Akses cepat ke alat pengembang dan manajemen template.
                </motion.p>

                {/* Action Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="grid md:grid-cols-2 gap-6 w-full max-w-4xl"
                >
                    {/* Admin Templates */}
                    <Link to="/admin/templates">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer text-left"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-premium-accent/10 flex items-center justify-center text-premium-accent mb-8 group-hover:scale-110 transition-transform">
                                <Layout className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Manage Templates</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Buat, edit, dan kelola template undangan premium untuk klien atau library publik.
                            </p>
                            <div className="flex items-center gap-2 text-premium-accent text-sm font-bold group-hover:gap-3 transition-all">
                                <span>Buka Manajemen</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </Link>

                    {/* Preview Demo */}
                    <Link to="/preview/draft">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer text-left"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-8 group-hover:scale-110 transition-transform">
                                <Eye className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Preview Draft</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Lihat hasil kerja terbaru Anda di editor dalam mode preview interaktif.
                            </p>
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-bold group-hover:gap-3 transition-all group-hover:text-gray-600">
                                <span>Lihat Preview</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Tool Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-6 w-full max-w-4xl"
                >
                    <Link to="/tools/background-remover">
                        <motion.div
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            className="group p-8 rounded-[2rem] bg-gradient-to-r from-premium-accent/5 to-transparent border border-premium-accent/20 hover:border-premium-accent/40 transition-all cursor-pointer text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-premium-accent flex items-center justify-center text-white">
                                    <Scissors className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">AI Background Remover</h3>
                                    <p className="text-gray-500 text-sm font-medium">Hapus background foto dalam hitungan detik.</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-premium-accent/20 flex items-center justify-center text-premium-accent group-hover:bg-premium-accent group-hover:text-white transition-all">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};
