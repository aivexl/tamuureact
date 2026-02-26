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
            <div className="w-full h-full max-w-[1600px] mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">
                        Product <span className="text-[#FFBF00]">Registry</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-2">Governance & Moderation Center</p>
                </div>
                
                <AdminProductManagement />
            </div>
        </AdminLayout>
    );
};

export default AdminProductsPage;
