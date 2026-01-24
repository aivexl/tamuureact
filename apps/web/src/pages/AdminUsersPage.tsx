import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    Mail,
    Calendar,
    Shield,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    User,
    ArrowUpDown,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface UserData {
    id: string;
    email: string;
    name: string;
    tier: string;
    expires_at: string | null;
    max_invitations: number;
    invitation_count: number;
    created_at: string;
}

export const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTier, setFilterTier] = useState('all');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        tier: '',
        expires_at: '',
        max_invitations: 1
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await admin.listUsers();
            setUsers(data);
        } catch (err) {
            console.error('[AdminUsers] Fetch error:', err);
            toast.error('Gagal mengambil data user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await admin.deleteUser(selectedUser.id);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setIsDeleteModalOpen(false);
            toast.success('User berhasil dihapus selamanya');
        } catch (err) {
            toast.error('Gagal menghapus user');
        }
    };

    const handleUpdateSubscription = async () => {
        if (!selectedUser) return;
        try {
            const data = await admin.updateUserSubscription(selectedUser.id, {
                tier: editForm.tier,
                expires_at: editForm.expires_at || null,
                max_invitations: editForm.max_invitations
            });

            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data.user } : u));
            setIsEditModalOpen(false);
            toast.success('Subscription user berhasil diperbarui');
        } catch (err) {
            toast.error('Gagal memperbarui subscription');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.email + user.name).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTier = filterTier === 'all' || user.tier === filterTier;
        return matchesSearch && matchesTier;
    });

    const isExpired = (expiry: string | null) => {
        if (!expiry) return false;
        return new Date(expiry) < new Date();
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-slate-400">Manage all registered users, their tiers, and access levels.</p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
                            />
                        </div>
                        <select
                            value={filterTier}
                            onChange={(e) => setFilterTier(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-bold uppercase tracking-widest text-xs outline-none cursor-pointer"
                        >
                            <option value="all" className="bg-[#111]">All Tiers</option>
                            <option value="free" className="bg-[#111]">Free</option>
                            <option value="pro" className="bg-[#111]">Pro</option>
                            <option value="platinum" className="bg-[#111]">Platinum</option>
                            <option value="vvip" className="bg-[#111]">VVIP</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest border border-white/5"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User Details</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tier Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Quota (Used/Max)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registration</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Fetching Users...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <Search className="w-12 h-12" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em]">No users found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.map((user) => (
                            <motion.tr
                                layout
                                key={user.id}
                                className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{user.name || 'Anonymous User'}</p>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 lowercase">
                                                <Mail className="w-3 h-3 opacity-50" />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg ${user.tier === 'vvip' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                                                user.tier === 'platinum' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                                    user.tier === 'pro' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/20' :
                                                        'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            {user.tier}
                                        </span>
                                        {user.expires_at ? (
                                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isExpired(user.expires_at) ? 'text-rose-400' : 'text-slate-500'}`}>
                                                <Calendar className="w-3 h-3" />
                                                {new Date(user.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {isExpired(user.expires_at) && <span className="ml-1 uppercase font-black">[Expired]</span>}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-emerald-400 font-black uppercase flex items-center gap-1.5 tracking-widest">
                                                <Shield className="w-3 h-3" /> Lifetime Access
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Usage</span>
                                            <span className="text-xs font-black text-white">{user.invitation_count} / {user.max_invitations}</span>
                                        </div>
                                        <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${(user.invitation_count / user.max_invitations) > 0.9 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-teal-500 shadow-[0_0_10px_#14b8a6]'
                                                    }`}
                                                style={{ width: `${Math.min(100, (user.invitation_count / user.max_invitations) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-xs text-white font-medium">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 opacity-50">Joined</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setEditForm({
                                                    tier: user.tier,
                                                    expires_at: user.expires_at ? user.expires_at.split('T')[0] : '',
                                                    max_invitations: user.max_invitations
                                                });
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-2.5 bg-white/5 hover:bg-teal-500/10 text-slate-400 hover:text-teal-400 rounded-xl transition-all border border-white/5 hover:border-teal-500/30"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-2.5 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all border border-white/5 hover:border-rose-500/30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Subscription Modal */}
            <AnimatePresence>
                {isEditModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0F0F0F] border border-white/10 rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Edit Subscription</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Updating account limits for <span className="text-teal-400 font-bold">{selectedUser.email}</span></p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">Subscription Tier</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['free', 'pro', 'platinum', 'vvip'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setEditForm(prev => ({ ...prev, tier: t }))}
                                                    className={`px-4 py-3 rounded-2xl border text-sm font-bold uppercase tracking-widest transition-all ${editForm.tier === t
                                                            ? 'bg-teal-500/10 border-teal-500/50 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">Max Invitations</label>
                                            <input
                                                type="number"
                                                value={editForm.max_invitations}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, max_invitations: parseInt(e.target.value) }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={editForm.expires_at}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, expires_at: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-bold outline-none cursor-pointer"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                            <p className="text-[9px] text-slate-500 mt-2 font-medium uppercase tracking-widest">Kosongkan untuk Lifetime</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-10">
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateSubscription}
                                        className="flex-[2] py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0F0F0F] border border-rose-500/20 rounded-3xl w-full max-w-sm relative z-10 overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.1)]"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                                    <Trash2 className="w-10 h-10 text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Hapus User?</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Tindakan ini permanen. Seluruh undangan dan data milik <span className="text-rose-400 font-bold">{selectedUser.email}</span> akan dihapus dari server.</p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleDeleteUser}
                                        className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-rose-500/20 transition-all"
                                    >
                                        Ya, Hapus Permanen
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                                    >
                                        Batalkan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};
