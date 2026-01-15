import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Power, MousePointer2, Layout, Check, Sparkles } from 'lucide-react';
import { invitations as invitationsApi } from '@/lib/api';

interface StatusTogglesProps {
    invitation: any;
    onUpdate: (updates: any) => void;
}

export const StatusToggles: React.FC<StatusTogglesProps> = ({ invitation, onUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    // Mock states for other toggles for now
    const [isScroll, setIsScroll] = useState(true);
    const [coverEnabled, setCoverEnabled] = useState(true);

    const handleTogglePublished = async (val: boolean) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            console.log('[StatusToggles] Updating is_published to:', val);
            await invitationsApi.update(invitation.id, { is_published: val });
            onUpdate({ ...invitation, is_published: val, status: val ? "Published" : "Draft" });
        } catch (err) {
            console.error('[StatusToggles] Failed to update status:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
            <ToggleCard
                icon={Power}
                label="Status Undangan"
                description={invitation.is_published ? "Online & Publik" : "Mode Draft (Private)"}
                value={invitation.is_published}
                onChange={handleTogglePublished}
                color="teal"
            />
            <ToggleCard
                icon={MousePointer2}
                label="Mode Navigasi"
                description="Scroll vs Halaman"
                value={isScroll}
                onChange={setIsScroll}
                color="indigo"
            />
            <ToggleCard
                icon={Layout}
                label="Cover Greeting"
                description="Tampilkan Sapaan"
                value={coverEnabled}
                onChange={setCoverEnabled}
                color="purple"
            />
        </div>
    );
};

interface ToggleCardProps {
    icon: any;
    label: string;
    description: string;
    value: boolean;
    onChange: (val: boolean) => void;
    color: 'teal' | 'indigo' | 'purple';
}

const ToggleCard: React.FC<ToggleCardProps> = ({ icon: Icon, label, description, value, onChange, color }) => {
    const colors = {
        teal: 'text-teal-600 bg-teal-50 border-teal-100 group-hover:bg-teal-500 group-hover:text-white',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 group-hover:bg-indigo-500 group-hover:text-white',
        purple: 'text-purple-600 bg-purple-50 border-purple-100 group-hover:bg-purple-500 group-hover:text-white',
    };

    const activeBg = {
        teal: 'bg-teal-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500',
    };
    const glowColors = {
        teal: 'bg-teal-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500',
    };

    const sparkColors = {
        teal: 'text-teal-400',
        indigo: 'text-indigo-400',
        purple: 'text-purple-400',
    };

    const dotColors = {
        teal: 'bg-teal-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500',
    };

    return (
        <m.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(!value)}
            className="group relative flex items-center justify-between p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 text-left w-full overflow-hidden"
        >
            {/* Background Glow removed */}

            <div className="relative z-10 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${colors[color]}`}>
                    <Icon className="w-6 h-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-800 tracking-tight">{label}</p>
                        {value && (
                            <m.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Sparkles className={`w-3 h-3 ${sparkColors[color]}`} />
                            </m.div>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">{description}</p>
                </div>
            </div>

            <div className={`w-14 h-7 rounded-full p-1.5 transition-all duration-500 relative ${value ? activeBg[color] : 'bg-slate-100 shadow-inner'}`}>
                <m.div
                    animate={{
                        x: value ? 28 : 0,
                        scale: value ? 1 : 0.9
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                    {value && <div className={`w-1 h-1 rounded-full ${dotColors[color]}`} />}
                </m.div>
            </div>
        </m.button>
    );
};
