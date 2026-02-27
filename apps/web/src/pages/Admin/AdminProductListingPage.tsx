import React from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { AdminProductListing } from '../../components/Admin/AdminProductListing';
import { useSEO } from '../../hooks/useSEO';

export const AdminProductListingPage: React.FC = () => {
    useSEO({
        title: 'Global Product Listing | Tamuu Admin',
        description: 'Post and manage administrative product listings with custom store branding.'
    });

    return (
        <AdminLayout>
            <div className="w-full h-full max-w-[1600px] mx-auto space-y-10 py-4 px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase block">Daftar <span className="text-[#FFBF00]">Produk</span></h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] mt-3 block text-[10px]">Manajemen Produk Admin</p>
                    </div>
                </div>
                
                <AdminProductListing />
            </div>
        </AdminLayout>
    );
};

export default AdminProductListingPage;
