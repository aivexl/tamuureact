import React from 'react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { AdminShopSettings } from '../components/Admin/AdminShopSettings';
import { useSEO } from '../hooks/useSEO';

export const AdminShopSettingsPage: React.FC = () => {
    useSEO({
        title: 'Shop Management | Tamuu Admin',
        description: 'Enterprise control center for the Shop Carousel and Discovery platform.'
    });

    return (
        <AdminLayout>
            <div className="w-full h-full max-w-[1600px] mx-auto">
                <AdminShopSettings />
            </div>
        </AdminLayout>
    );
};
