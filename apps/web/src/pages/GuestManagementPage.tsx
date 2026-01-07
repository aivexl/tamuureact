
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { ImportModal } from '../components/Modals/ImportModal';
import { ConfirmationModal } from '../components/Modals/ConfirmationModal';
import { QRModal } from '../components/Modals/QRModal';
import * as XLSX from 'xlsx';

// ============================================
// INLINE SVG ICONS
// ============================================
const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);
const CopyIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);
const MessageSquareIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
const Edit2Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
);
const Trash2Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
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
const FileDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" />
    </svg>
);
const QrCodeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
    </svg>
);

// ============================================
// TYPES
// ============================================
interface Guest {
    id: string;
    checkInCode: string;
    name: string;
    phone: string | null;
    address: string;
    tableNumber: string;
    tier: 'reguler' | 'vip' | 'vvip';
    guestCount: number;
    sharedAt: string | null;
    checkedInAt: string | null;
    checkedOutAt: string | null;
}

// ============================================
// DUMMY DATA
// ============================================
const DUMMY_INVITATION = {
    id: 'inv-001',
    name: 'Pernikahan Anisa & Budi',
    slug: 'anisa-budi',
    category: 'wedding',
};

const DUMMY_GUESTS: Guest[] = [
    { id: '1', checkInCode: 'AB001', name: 'Budi Santoso', phone: '6281234567890', address: 'Jakarta', tableNumber: 'A1', tier: 'vip', guestCount: 2, sharedAt: '2026-01-01T10:00:00Z', checkedInAt: '2026-01-02T18:30:00Z', checkedOutAt: null },
    { id: '2', checkInCode: 'AB002', name: 'Siti Rahma', phone: '6285678901234', address: 'Bandung', tableNumber: 'A2', tier: 'vvip', guestCount: 3, sharedAt: '2026-01-01T11:00:00Z', checkedInAt: null, checkedOutAt: null },
    { id: '3', checkInCode: 'AB003', name: 'Ahmad Hidayat', phone: '6287890123456', address: 'Surabaya', tableNumber: 'B1', tier: 'reguler', guestCount: 1, sharedAt: null, checkedInAt: null, checkedOutAt: null },
    { id: '4', checkInCode: 'AB004', name: 'Dewi Lestari', phone: '6289012345678', address: 'Yogyakarta', tableNumber: 'B2', tier: 'reguler', guestCount: 2, sharedAt: '2026-01-01T14:00:00Z', checkedInAt: '2026-01-02T19:00:00Z', checkedOutAt: '2026-01-02T22:00:00Z' },
    { id: '5', checkInCode: 'AB005', name: 'Rizki Pratama', phone: '6281122334455', address: 'Semarang', tableNumber: 'C1', tier: 'vip', guestCount: 4, sharedAt: null, checkedInAt: null, checkedOutAt: null },
];

const DEFAULT_MESSAGE = "Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir di acara Pernikahan kami.";

// ============================================
// MAIN COMPONENT
// ============================================
export const GuestManagementPage: React.FC = () => {
    const { invitationId } = useParams<{ invitationId: string }>();
    const [guests, setGuests] = useState<Guest[]>(DUMMY_GUESTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [invitationMessage, setInvitationMessage] = useState(DEFAULT_MESSAGE);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [guestToDelete, setGuestToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // QR Modal State
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedQRGuest, setSelectedQRGuest] = useState<Guest | null>(null);

    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '', phone: '', address: 'di tempat', tableNumber: '', tier: 'reguler' as Guest['tier'], guestCount: 1
    });

    // Import state
    const [showImportModal, setShowImportModal] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    useSEO({
        title: 'Buku Tamu - Tamuu',
        description: 'Kelola daftar tamu undangan digital Anda.',
    });

    // Computed
    const filteredGuests = guests.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.phone?.includes(searchQuery) ||
        g.checkInCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: guests.reduce((acc, g) => acc + g.guestCount, 0),
        waSent: guests.filter(g => g.sharedAt).length,
        vip: guests.filter(g => g.tier === 'vip' || g.tier === 'vvip').length,
        checkedIn: guests.filter(g => g.checkedInAt).length,
        checkedOut: guests.filter(g => g.checkedOutAt).length,
    };

    // Methods
    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const normalizePhone = (phone: string) => {
        let p = phone.replace(/\D/g, ''); // Remove non-digits
        if (p.startsWith('0')) {
            p = '62' + p.slice(1);
        } else if (!p.startsWith('62')) {
            p = '62' + p;
        }
        return p;
    };

    const copyGeneralLink = () => {
        navigator.clipboard.writeText(`https://tamuu.id/${DUMMY_INVITATION.slug}`);
        showToast('Link umum disalin!');
    };

    const copyGuestLink = (guest: Guest) => {
        navigator.clipboard.writeText(`https://tamuu.id/${DUMMY_INVITATION.slug}?to=${encodeURIComponent(guest.name)}`);
        showToast(`Link untuk ${guest.name} disalin!`);
    };

    const shareWhatsApp = (guest: Guest) => {
        const phone = guest.phone || '';
        const message = `${invitationMessage}\n\nLink Undangan: https://tamuu.id/${DUMMY_INVITATION.slug}?to=${encodeURIComponent(guest.name)}`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');

        // Mark as shared
        setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, sharedAt: new Date().toISOString() } : g));
        showToast('WhatsApp dibuka!');
    };

    const handleAddGuest = () => {
        if (!formData.name) return;
        const newGuest: Guest = {
            id: Date.now().toString(),
            checkInCode: `AB${String(guests.length + 1).padStart(3, '0')}`,
            name: formData.name,
            phone: formData.phone ? normalizePhone(formData.phone) : null,
            address: formData.address,
            tableNumber: formData.tableNumber,
            tier: formData.tier,
            guestCount: formData.guestCount,
            sharedAt: null,
            checkedInAt: null,
            checkedOutAt: null,
        };
        setGuests(prev => [newGuest, ...prev]);
        setShowAddModal(false);
        setFormData({ name: '', phone: '', address: 'di tempat', tableNumber: '', tier: 'reguler', guestCount: 1 });
        showToast('Tamu berhasil ditambahkan!');
    };

    const openEditModal = (guest: Guest) => {
        setEditingGuest(guest);
        setFormData({
            name: guest.name,
            phone: guest.phone?.replace(/^62/, '0') || '',
            address: guest.address,
            tableNumber: guest.tableNumber,
            tier: guest.tier,
            guestCount: guest.guestCount,
        });
        setShowEditModal(true);
    };

    const handleUpdateGuest = () => {
        if (!editingGuest || !formData.name) return;
        setGuests(prev => prev.map(g => g.id === editingGuest.id ? {
            ...g,
            name: formData.name,
            phone: formData.phone ? normalizePhone(formData.phone) : null,
            address: formData.address,
            tableNumber: formData.tableNumber,
            tier: formData.tier,
            guestCount: formData.guestCount,
        } : g));
        setShowEditModal(false);
        setEditingGuest(null);
        showToast('Data tamu diperbarui!');
    };

    const handleDeleteGuest = (guestId: string) => {
        setGuestToDelete(guestId);
        setShowDeleteModal(true);
    };

    const confirmDeleteGuest = () => {
        if (!guestToDelete) return;
        setIsDeleting(true);
        setTimeout(() => {
            setGuests(prev => prev.filter(g => g.id !== guestToDelete));
            showToast('Tamu dihapus!');
            setIsDeleting(false);
            setShowDeleteModal(false);
            setGuestToDelete(null);
        }, 500); // Simulate network delay
    };

    const handleShowQR = (guest: Guest) => {
        setSelectedQRGuest(guest);
        setShowQRModal(true);
    };

    // ============================================
    // IMPORT / EXPORT LOGIC
    // ============================================

    const downloadImportFormat = (format: 'csv' | 'xlsx') => {
        const data = [
            { 'Tier': 'VIP', 'Nama': 'Contoh Nama VIP', 'No WhatsApp': '081234567890', 'Alamat': 'Jakarta', 'Jumlah': 2, 'Meja': 'Meja A1' },
            { 'Tier': 'REGULER', 'Nama': 'Contoh Nama Reguler', 'No WhatsApp': '085678901234', 'Alamat': 'di tempat', 'Jumlah': 1, 'Meja': 'Room 302' }
        ];

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Import');
            XLSX.writeFile(workbook, 'format-import-tamu.xlsx');
        } else {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Import');
            XLSX.writeFile(workbook, 'format-import-tamu.csv', { bookType: 'csv' });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Redundant - now handled inside ImportModal
    };

    const confirmImport = (pendingGuests: any[]) => {
        setIsImporting(true);
        setTimeout(() => {
            const newGuests: Guest[] = pendingGuests.map((ig, i) => ({
                id: `import-${Date.now()}-${i}`,
                checkInCode: `IM${String(guests.length + i + 1).padStart(3, '0')}`,
                name: ig.name,
                phone: ig.phone ? normalizePhone(ig.phone) : null,
                address: ig.address,
                tableNumber: ig.tableNumber,
                tier: ig.tier,
                guestCount: ig.guestCount,
                sharedAt: null,
                checkedInAt: null,
                checkedOutAt: null
            }));

            setGuests(prev => [...newGuests, ...prev]);
            setShowImportModal(false);
            setIsImporting(false);
            showToast(`Berhasil mengimpor ${newGuests.length} tamu!`);
        }, 1000);
    };

    const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
        const exportData = guests.map(g => ({
            'ID': g.checkInCode,
            'Tier': g.tier.toUpperCase(),
            'Nama': g.name,
            'WhatsApp': g.phone ? `+ ${g.phone} ` : '-',
            'Alamat': g.address,
            'Meja': g.tableNumber || '-',
            'Jumlah': g.guestCount,
            'Status WA': g.sharedAt ? 'Terkirim' : 'Belum',
            'Kehadiran': g.checkedInAt ? 'Hadir' : 'Belum'
        }));

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Tamu');
            XLSX.writeFile(workbook, `export -tamu - ${invitationId || 'data'}.xlsx`);
        } else if (format === 'json') {
            const blob = new Blob([JSON.stringify(guests, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `export -tamu - ${invitationId || 'data'}.json`;
            link.click();
        } else {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `export -tamu - ${invitationId || 'data'}.csv`;
            link.click();
        }
        setShowExportDropdown(false);
    };

    const getTierBadge = (tier: Guest['tier']) => {
        const styles = {
            vvip: 'bg-purple-50 text-purple-700 ring-purple-100',
            vip: 'bg-amber-50 text-amber-700 ring-amber-100',
            reguler: 'bg-slate-50 text-slate-600 ring-slate-100',
        };
        return styles[tier];
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-14">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link to="/dashboard" className="flex items-center text-sm text-slate-500 hover:text-teal-600 transition-colors mb-2">
                            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Kembali ke Dashboard
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buku Tamu Digital</h1>
                        <p className="text-slate-500">Kelola tamu dan kirim undangan personal dengan mudah.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={copyGeneralLink} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                            <CopyIcon className="w-4 h-4" /> Copy General Link
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
                            <PlusIcon className="w-5 h-5" /> Tambah Tamu
                        </button>
                    </div>
                </div>
            </div>

            <main className="p-4 lg:p-8 space-y-8">
                {/* Message & Stats Section */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-50" />
                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
                        {/* Message */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm uppercase tracking-wider">
                                <MessageSquareIcon className="w-4 h-4" /> Pesan Undangan WhatsApp
                            </div>
                            <p className="text-sm text-slate-500 italic">Pesan ini akan dikirimkan bersama link undangan personal tamu.</p>
                            <textarea
                                value={invitationMessage}
                                onChange={e => setInvitationMessage(e.target.value)}
                                rows={4}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-slate-700"
                                placeholder="Tulis pesan undanganmu di sini..."
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Pesan akan dikirim bersama link personal.</span>
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all">
                                    <CheckIcon className="w-4 h-4" /> Simpan Pesan
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="w-full lg:w-96 grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 col-span-2">
                                <p className="text-[10px] text-teal-600 font-bold uppercase mb-0.5">Total Tamu (Orang)</p>
                                <p className="text-2xl font-black text-teal-900">{stats.total}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                <p className="text-[10px] text-indigo-600 font-bold uppercase mb-0.5">WA Terkirim</p>
                                <p className="text-2xl font-black text-indigo-900">{stats.waSent}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                <p className="text-[10px] text-amber-600 font-bold uppercase mb-0.5">VIP & VVIP</p>
                                <p className="text-2xl font-black text-amber-900">{stats.vip}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <p className="text-[10px] text-emerald-600 font-bold uppercase mb-0.5">Sudah Check-in</p>
                                <p className="text-2xl font-black text-emerald-900">{stats.checkedIn}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                <p className="text-[10px] text-rose-600 font-bold uppercase mb-0.5">Sudah Check-out</p>
                                <p className="text-2xl font-black text-rose-900">{stats.checkedOut}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="relative flex-1 max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari nama, nomor, atau kode..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-teal-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-900/10"
                        >
                            <FileUpIcon className="w-4 h-4" /> Import CSV / Excel
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
                            >
                                <FileDownIcon className="w-4 h-4" /> Export
                            </button>
                            {showExportDropdown && (
                                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-2 w-48 overflow-hidden">
                                    <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-2">
                                        Export ke Excel (.xlsx)
                                    </button>
                                    <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2">
                                        Export ke CSV
                                    </button>
                                    <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2">
                                        Export ke JSON
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Guest Table */}
                <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0" style={{ minWidth: '1000px' }}>
                            <thead>
                                <tr className="bg-[#2C5F5F] text-white">
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">ID</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Tier</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Nama Tamu</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">No WhatsApp</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Alamat</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Meja</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Jumlah</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Status WA</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Kehadiran</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredGuests.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400 italic">
                                            Belum ada data tamu. Klik "Tambah Tamu" untuk memulai.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGuests.map(guest => (
                                        <tr key={guest.id} className="hover:bg-slate-50 transition-all duration-200">
                                            <td className="px-4 py-4 text-[12px] font-mono text-slate-500 uppercase font-bold">{guest.checkInCode}</td>
                                            <td className="px-4 py-4">
                                                <span className={`text - [9px] font - black uppercase tracking - widest px - 2 py - 1 rounded - lg ring - 1 ring - inset ${getTierBadge(guest.tier)} `}>
                                                    {guest.tier === 'reguler' ? 'REG' : guest.tier.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-[13px] font-bold text-slate-800">{guest.name}</td>
                                            <td className="px-4 py-4 text-[12px] text-slate-600 font-medium">+{guest.phone || '-'}</td>
                                            <td className="px-4 py-4 text-[12px] text-slate-600 truncate max-w-[120px]">{guest.address}</td>
                                            <td className="px-4 py-4 text-[12px] font-bold text-indigo-600">{guest.tableNumber || '-'}</td>
                                            <td className="px-4 py-4 text-center text-[13px] font-black text-[#2C5F5F]">{guest.guestCount}</td>
                                            <td className="px-4 py-4 text-center">
                                                {guest.sharedAt ? (
                                                    <span className="text-emerald-500 text-[10px] font-black">TERKIRIM</span>
                                                ) : (
                                                    <span className="text-slate-300 text-[10px] font-black">BELUM</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {guest.checkedInAt ? (
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg">HADIR</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-300 text-[9px] font-black rounded-lg">BELUM</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => shareWhatsApp(guest)} className={`p - 2 rounded - xl transition - all hover: scale - 110 ${guest.sharedAt ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} `} title="Kirim WhatsApp">
                                                        {guest.sharedAt ? <CheckIcon className="w-4 h-4" /> : <MessageSquareIcon className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleShowQR(guest)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="QR Code"
                                                    >
                                                        <QrCodeIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => copyGuestLink(guest)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Salin Link">
                                                        <CopyIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEditModal(guest)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                                                        <Edit2Icon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteGuest(guest.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Hapus">
                                                        <Trash2Icon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Add Guest Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                        <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <XIcon className="w-5 h-5 text-slate-400" />
                            </button>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tambah Tamu Baru</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Nama Tamu *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-900" placeholder="Nama lengkap" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">No WhatsApp</label>
                                    <div className="mt-1 flex">
                                        <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">+62</span>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-900" placeholder="81234567890" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Alamat</label>
                                        <input type="text" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" placeholder="di tempat" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Meja/Kursi</label>
                                        <input type="text" value={formData.tableNumber} onChange={e => setFormData(p => ({ ...p, tableNumber: e.target.value }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" placeholder="A1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Tier</label>
                                        <select value={formData.tier} onChange={e => setFormData(p => ({ ...p, tier: e.target.value as Guest['tier'] }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900">
                                            <option value="reguler">Reguler</option>
                                            <option value="vip">VIP</option>
                                            <option value="vvip">VVIP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Jumlah Tamu</label>
                                        <input type="number" min={1} value={formData.guestCount} onChange={e => setFormData(p => ({ ...p, guestCount: parseInt(e.target.value) || 1 }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">Batal</button>
                                <button onClick={handleAddGuest} className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all">Tambah Tamu</button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Guest Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                        <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <XIcon className="w-5 h-5 text-slate-400" />
                            </button>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Data Tamu</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Nama Tamu *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-900" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">No WhatsApp</label>
                                    <div className="mt-1 flex">
                                        <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">+62</span>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-900" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Alamat</label>
                                        <input type="text" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Meja/Kursi</label>
                                        <input type="text" value={formData.tableNumber} onChange={e => setFormData(p => ({ ...p, tableNumber: e.target.value }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Tier</label>
                                        <select value={formData.tier} onChange={e => setFormData(p => ({ ...p, tier: e.target.value as Guest['tier'] }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900">
                                            <option value="reguler">Reguler</option>
                                            <option value="vip">VIP</option>
                                            <option value="vvip">VVIP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Jumlah Tamu</label>
                                        <input type="number" min={1} value={formData.guestCount} onChange={e => setFormData(p => ({ ...p, guestCount: parseInt(e.target.value) || 1 }))} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">Batal</button>
                                <button onClick={handleUpdateGuest} className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all">Simpan</button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast.show && (
                    <m.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-900 text-white font-medium rounded-2xl shadow-xl"
                    >
                        {toast.message}
                    </m.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteGuest}
                title="Hapus Data Tamu?"
                message="Data tamu yang dihapus tidak dapat dikembalikan lagi. Anda harus menambahkan ulang jika ingin mengundangnya kembali."
                confirmText="Hapus Tamu"
                cancelText="Batal"
                type="danger"
                isLoading={isDeleting}
            />

            <QRModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                guestName={selectedQRGuest?.name || 'Tamu'}
                url={`https://app.tamuu.id/welcome/${invitationId || 'preview'}/${selectedQRGuest?.id || ''}`}
                tier={selectedQRGuest?.tier}
            />

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDownloadFormat={downloadImportFormat}
                onConfirm={confirmImport}
                isImporting={isImporting}
            />
        </div>
    );
};

export default GuestManagementPage;
