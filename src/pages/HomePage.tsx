import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Layout, Eye, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] text-white">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
                {/* Logo / Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-premium-accent to-premium-accent/60 flex items-center justify-center shadow-lg shadow-premium-accent/20">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-premium-accent to-white bg-clip-text text-transparent">
                        Tamuu Studio
                    </h1>
                    <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">
                        Premium Wedding Invitation Builder
                    </p>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-lg md:text-xl text-white/60 max-w-md mb-12"
                >
                    Create stunning, interactive digital wedding invitations with our visual editor.
                </motion.p>

                {/* Action Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="grid md:grid-cols-2 gap-4 w-full max-w-2xl"
                >
                    {/* Admin Templates */}
                    <Link to="/admin/templates">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group p-6 rounded-2xl bg-gradient-to-br from-premium-accent/20 to-premium-accent/5 border border-premium-accent/30 hover:border-premium-accent/60 transition-all cursor-pointer"
                        >
                            <Layout className="w-8 h-8 text-premium-accent mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Manage Templates</h3>
                            <p className="text-white/50 text-sm mb-4">
                                Create, edit, and manage invitation templates for your clients.
                            </p>
                            <div className="flex items-center gap-2 text-premium-accent text-sm font-medium group-hover:gap-3 transition-all">
                                <span>Open Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </Link>

                    {/* Preview Demo */}
                    <Link to="/preview/draft">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                        >
                            <Eye className="w-8 h-8 text-white/60 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Preview Draft</h3>
                            <p className="text-white/50 text-sm mb-4">
                                Preview your current work-in-progress invitation design.
                            </p>
                            <div className="flex items-center gap-2 text-white/60 text-sm font-medium group-hover:gap-3 group-hover:text-white transition-all">
                                <span>View Preview</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="mt-12 flex gap-6 text-sm text-white/30"
                >
                    <Link to="/editor" className="hover:text-premium-accent transition-colors">
                        New Invitation
                    </Link>
                    <span>•</span>
                    <Link to="/admin/templates" className="hover:text-premium-accent transition-colors">
                        Templates
                    </Link>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-white/20 text-xs">
                    © 2024 Tamuu Studio. All rights reserved.
                </p>
            </div>
        </div>
    );
};
