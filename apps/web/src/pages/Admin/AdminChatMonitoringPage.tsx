import React from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { ChatInterface } from '../../components/Chat/ChatInterface';
import { MessageSquare } from 'lucide-react';

export const AdminChatMonitoringPage: React.FC = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-rose-500" />
                        Chat Monitoring
                    </h1>
                    <p className="text-slate-400">Stealth observation of user and vendor interactions.</p>
                </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <ChatInterface mode="admin" />
            </div>
        </AdminLayout>
    );
};

export default AdminChatMonitoringPage;
