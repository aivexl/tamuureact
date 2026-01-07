import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

interface ImportGuest {
    name: string;
    phone: string | null;
    address: string;
    tableNumber: string;
    tier: 'reguler' | 'vip' | 'vvip';
    guestCount: number;
}

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownloadFormat: (format: 'csv' | 'xlsx') => void;
    onConfirm: (guests: ImportGuest[]) => void;
    isImporting: boolean;
}

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const FileUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M12 12v6" /><path d="m15 15-3-3-3 3" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
);

const LoaderIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
        </path>
    </svg>
);

export const ImportModal: React.FC<ImportModalProps> = ({
    isOpen, onClose, onDownloadFormat, onConfirm, isImporting
}) => {
    const [pendingGuests, setPendingGuests] = useState<ImportGuest[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | undefined;

        // Prioritize DragEvent (dataTransfer) because if dropping on the input, 
        // e.target.files might exist (as a property) but be empty since we preventDefault.
        if ('dataTransfer' in e) {
            file = e.dataTransfer.files[0];
        } else if ('files' in e.target && e.target.files) {
            file = e.target.files[0];
        }

        if (!file) return;

        const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = event.target?.result;
            let rows: any[] = [];

            if (isExcel) {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                rows = XLSX.utils.sheet_to_json(worksheet);
            } else {
                const text = data as string;
                const lines = text.split('\n');
                rows = lines.slice(1).filter(l => l.trim()).map((line) => {
                    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                    return {
                        'Tier': cols[0],
                        'Nama': cols[1],
                        'No WhatsApp': cols[2],
                        'Alamat': cols[3],
                        'Jumlah': cols[4],
                        'Meja': cols[5]
                    };
                });
            }

            const parsed = rows.map((row: any) => ({
                name: row['Nama'] || row['name'] || '',
                phone: row['No WhatsApp'] || row['phone'] ? String(row['No WhatsApp'] || row['phone']).replace(/\D/g, '') : null,
                address: row['Alamat'] || row['address'] || 'di tempat',
                tier: (String(row['Tier'] || row['tier'] || 'reguler').toLowerCase()) as ImportGuest['tier'],
                guestCount: parseInt(row['Jumlah'] || row['count']) || 1,
                tableNumber: row['Meja'] || row['table'] || ''
            })).filter(g => g.name);

            setPendingGuests(parsed);
        };

        if (isExcel) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };

    const handleCancel = () => {
        setPendingGuests([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={handleCancel}
                    />
                    <m.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Import Daftar Tamu</h2>
                                <p className="text-sm text-slate-500 font-medium">Tambah tamu massal secara kilat melalui file CSV.</p>
                            </div>
                            <button onClick={handleCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <XIcon className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {pendingGuests.length === 0 ? (
                                <div className="space-y-6">
                                    {/* Info box */}
                                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <InfoIcon className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-amber-800 text-sm">Gunakan Format yang Benar</h4>
                                            <p className="text-xs text-amber-700/80 leading-relaxed">Penting bagi sistem untuk mengenali struktur data Anda. Silakan gunakan template kami.</p>
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <button
                                                    onClick={() => onDownloadFormat('xlsx')}
                                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    Format .XLSX
                                                </button>
                                                <button
                                                    onClick={() => onDownloadFormat('csv')}
                                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    Format .CSV
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Area */}
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e); }}
                                        className={`border-2 border-dashed rounded-[2rem] p-12 transition-all flex flex-col items-center justify-center relative group ${isDragging ? 'border-teal-500 bg-teal-50 shadow-inner' : 'border-slate-200 hover:border-teal-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors mb-4 ${isDragging ? 'bg-teal-100 text-teal-600' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500'
                                            }`}>
                                            <FileUpIcon className="w-10 h-10" />
                                        </div>
                                        <p className="font-bold text-slate-700 text-center">Klik atau seret file ke sini</p>
                                        <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-black text-center">Format .csv, .xlsx</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-emerald-800 text-sm">{pendingGuests.length} tamu siap diimpor</span>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center w-12">#</th>
                                                    <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Nama</th>
                                                    <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Tier</th>
                                                    <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">WhatsApp</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {pendingGuests.slice(0, 10).map((g, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 text-slate-400 text-center">{i + 1}</td>
                                                        <td className="px-4 py-3 font-bold text-slate-800">{g.name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${g.tier === 'vvip' ? 'bg-purple-100 text-purple-700' :
                                                                g.tier === 'vip' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {g.tier}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 tabular-nums">+{g.phone || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {pendingGuests.length > 10 && (
                                            <div className="p-3 text-center text-[10px] font-bold text-slate-400 bg-slate-50/50 border-t border-slate-100">
                                                ...DAN {pendingGuests.length - 10} TAMU LAINNYA
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                            <button
                                onClick={handleCancel}
                                disabled={isImporting}
                                className="px-6 py-3 text-slate-500 font-bold hover:text-slate-900 transition-all disabled:opacity-50"
                            >
                                {pendingGuests.length > 0 ? 'Batal' : 'Tutup'}
                            </button>
                            {pendingGuests.length > 0 && (
                                <button
                                    onClick={() => onConfirm(pendingGuests)}
                                    disabled={isImporting}
                                    className="px-8 py-3 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isImporting ? (
                                        <>
                                            <LoaderIcon className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>Simpan {pendingGuests.length} Tamu</>
                                    )}
                                </button>
                            )}
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
