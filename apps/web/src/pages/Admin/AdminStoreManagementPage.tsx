import React from 'react';
import { AdminLayout } from '../components/Layout/AdminLayout';
import { AdminStoreManagement } from '../components/Admin/AdminStoreManagement';
import { useSEO } from '../hooks/useSEO';

export const AdminStoreManagementPage: React.FC = () => {
    useSEO({
        title: 'Store Governance | Tamuu Admin',
        description: 'Enterprise governance, moderation, and quality control for Tamuu merchants.'
    });

    return (
        <AdminLayout>
            <div className="w-full h-full max-w-[1600px] mx-auto">
                <AdminStoreManagement />
            </div>
        </AdminLayout>
    );
};
