import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, ShieldAlert, Store, UserX, UserCheck, ShieldOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumLoader } from '../../ui/PremiumLoader';

// Mock Data for Merchants
const MOCK_MERCHANTS = [
    {
        id: '1',
        name: 'Nusantara Wedding Organizer',
        owner: 'Budi Santoso',
        email: 'budi@nusantara.id',
        status: 'active',
        joinedAt: '2023-11-15',
        productsCount: 12,
        rating: 4.8
    },
    {
        id: '2',
        name: 'Elite Cinematic',
        owner: 'Dimas Wijaya',
        email: 'hello@elitecinematic.com',
        status: 'suspended',
        joinedAt: '2024-01-20',
        productsCount: 3,
        rating: 4.2
    },
    {
        id: '3',
        name: 'Rasa Katering',
        owner: 'Siti Aminah',
        email: 'info@rasakatering.id',
        status: 'banned',
        joinedAt: '2023-08-05',
        productsCount: 0,
        rating: 3.5
    }
];

export const AdminStoreManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [merchants, setMerchants] = useState(MOCK_MERCHANTS);
    const [isLoading, setIsLoading] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    const filteredMerchants = merchants.filter(merchant =>
        merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStatusChange = (id: string, newStatus: 'active' | 'suspended' | 'banned', merchantName: string) => {
        setIsLoading(true);
        setActiveActionMenu(null);

        // Simulate API update
        setTimeout(() => {
            setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
            setIsLoading(false);

            if (newStatus === 'suspended') toast.error(`${merchantName} has been Suspended.`);
            if (newStatus === 'banned') toast.error(`${merchantName} has been Banned from the platform.`);
            if (newStatus === 'active') toast.success(`${merchantName} is now Active.`);
        }, 600);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">Active</span>;
            case 'suspended':
                return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20">Suspended</span>;
            case 'banned':
                return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider border border-rose-500/20 flex items-center gap-1"><ShieldOff className="w-3 h-3" /> Banned</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Store className="w-8 h-8 text-teal-500" />
                        Store Management
                    </h1>
                    <p className="text-slate-400 font-medium">Enterprise governance and quality control for merchants.</p>
                </div>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {/* Toolbar */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-[#1A1A1A]">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search merechants by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                        />
                    </div>
                    <button className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/5">
                        <Filter className="w-4 h-4" />
                        Filter Status
                    </button>
                </div>

                {/* Data Grid */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-slate-500 bg-black/20">
                                <th className="px-6 py-4 font-bold">Merchant Name</th>
                                <th className="px-6 py-4 font-bold">Owner Contact</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Listings</th>
                                <th className="px-6 py-4 font-bold text-right">Sanctions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <PremiumLoader variant="inline" color="#14B8A6" showLabel label="Syncing Merchant Data..." />
                                    </td>
                                </tr>
                            ) : filteredMerchants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                                        No merchants found matching your query.
                                    </td>
                                </tr>
                            ) : (
                                filteredMerchants.map((merchant) => (
                                    <tr key={merchant.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-sm">{merchant.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Joined {merchant.joinedAt}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-300">{merchant.owner}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{merchant.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(merchant.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-300">{merchant.productsCount} <span className="text-xs text-slate-500 font-normal">Active</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setActiveActionMenu(activeActionMenu === merchant.id ? null : merchant.id)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {/* Action Dropdown Menu */}
                                            <AnimatePresence>
                                                {activeActionMenu === merchant.id && (
                                                    <m.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        className="absolute right-6 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 origin-top-right text-left"
                                                    >
                                                        {merchant.status !== 'active' && (
                                                            <button
                                                                onClick={() => handleStatusChange(merchant.id, 'active', merchant.name)}
                                                                className="w-full text-left px-4 py-3 text-sm text-teal-400 font-bold hover:bg-teal-500/10 flex items-center gap-2 transition-colors"
                                                            >
                                                                <UserCheck className="w-4 h-4" /> Restore Access
                                                            </button>
                                                        )}
                                                        {merchant.status !== 'suspended' && (
                                                            <button
                                                                onClick={() => handleStatusChange(merchant.id, 'suspended', merchant.name)}
                                                                className="w-full text-left px-4 py-3 text-sm text-amber-500 font-bold hover:bg-amber-500/10 flex items-center gap-2 border-t border-white/5 transition-colors"
                                                            >
                                                                <ShieldAlert className="w-4 h-4" /> Suspend Store
                                                            </button>
                                                        )}
                                                        {merchant.status !== 'banned' && (
                                                            <button
                                                                onClick={() => handleStatusChange(merchant.id, 'banned', merchant.name)}
                                                                className="w-full text-left px-4 py-3 text-sm text-rose-500 font-bold hover:bg-rose-500/10 flex items-center gap-2 border-t border-white/5 transition-colors"
                                                            >
                                                                <UserX className="w-4 h-4" /> Ban Permanently
                                                            </button>
                                                        )}
                                                    </m.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
