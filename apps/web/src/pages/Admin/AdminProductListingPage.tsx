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
            <div className="w-full h-full max-w-[1600px] mx-auto space-y-10 py-10 px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                    <div>
                        <h1 className="text-5xl font-black text-[#0A1128] tracking-tighter italic uppercase block">Product Listing</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] mt-2 block">Enterprise Marketplace Hub</p>
                    </div>
                </div>
                
                <AdminProductListing />
            </div>
        </AdminLayout>
    );
};

export default AdminProductListingPage;
