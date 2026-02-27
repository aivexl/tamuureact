import React from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { AdminProductManagement } from '../../components/Admin/AdminProductManagement';
import { useSEO } from '../../hooks/useSEO';

export const AdminProductsPage: React.FC = () => {
    useSEO({
        title: 'Global Product Registry | Tamuu Admin',
        description: 'Comprehensive asset oversight and moderation controls for the Tamuu ecosystem.'
    });

    return (
        <AdminLayout>
                        <div className="w-full h-full max-w-[1600px] mx-auto py-4 px-6">
                            <div className="mb-12 border-b border-white/5 pb-10">
                                <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">Moderasi <span className="text-[#FFBF00]">Produk</span></h1>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Pusat Persetujuan & Governance</p>
                            </div>
                
                <AdminProductManagement />
            </div>
        </AdminLayout>
    );
};

export default AdminProductsPage;
