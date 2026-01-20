import React from 'react';
import { m } from 'framer-motion';
import { Sparkles, Monitor, Layout, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { UserKonvaPreview } from '../UserKonvaPreview';
import { UserElementEditor } from '../UserElementEditor';

export const OrbitPanel: React.FC = () => {
    const { orbit } = useStore();

    return (
        <div className="space-y-8 p-1">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-outfit">Cinematic Stage</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Edit elemen dekorasi di sisi kiri & kanan</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Stage */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                <Monitor className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Stage Kiri</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-6">
                        <div className="aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <UserKonvaPreview canvasType="orbit-left" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">Live Preview</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {orbit.left.elements && orbit.left.elements.filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false).length > 0 ? (
                                orbit.left.elements
                                    .filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false)
                                    .map(element => (
                                        <UserElementEditor
                                            key={element.id}
                                            element={element}
                                            sectionId="orbit-left"
                                        />
                                    ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Stage Kiri sudah diatur Admin <br />
                                        <span className="text-[8px] opacity-70">Tidak ada bagian yang diizinkan untuk diubah</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Stage */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                <Monitor className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Stage Kanan</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-6">
                        <div className="aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <UserKonvaPreview canvasType="orbit-right" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">Live Preview</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {orbit.right.elements && orbit.right.elements.filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false).length > 0 ? (
                                orbit.right.elements
                                    .filter(el => el.permissions?.canEditContent !== false && el.permissions?.isVisibleInUserEditor !== false)
                                    .map(element => (
                                        <UserElementEditor
                                            key={element.id}
                                            element={element}
                                            sectionId="orbit-right"
                                        />
                                    ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Stage Kanan sudah diatur Admin <br />
                                        <span className="text-[8px] opacity-70">Tidak ada bagian yang diizinkan untuk diubah</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hint Box */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-teal-500/5 border border-teal-500/10 rounded-3xl p-6 flex items-start gap-4"
            >
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Layout className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-teal-900 tracking-tight uppercase tracking-widest mb-1">Tips Cinematic Stage</h4>
                    <p className="text-xs text-teal-700/70 font-medium leading-relaxed">
                        Orbit atau Cinematic Stage adalah elemen dekoratif yang muncul di sisi kiri dan kanan layar pada tampilan Desktop.
                        Warna latar belakang dan elemen di sini biasanya mengikuti tema utama undangan Anda.
                    </p>
                </div>
            </m.div>
        </div>
    );
};
