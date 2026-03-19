import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { ImportModal } from '../components/Modals/ImportModal';
import { ConfirmationModal } from '../components/Modals/ConfirmationModal';
import { QRModal } from '../components/Modals/QRModal';
import { DownloadCardModal } from '../components/Modals/DownloadCardModal';
import * as XLSX from 'xlsx';
import { guests as guestsApi, invitations as invitationsApi } from '../lib/api';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { getPublicDomain } from '../lib/utils';
import { AnimatedCopyIcon } from '../components/ui/AnimatedCopyIcon';

import { 
    Plus as PlusIcon,
    Search as SearchIcon,
    MessageSquare as MessageSquareIcon,
    Edit2 as Edit2Icon,
    Trash2 as Trash2Icon,
    Check as CheckIcon,
    X as XIcon,
    FileUp as FileUpIcon,
    FileDown as FileDownIcon,
    ArrowLeft as ArrowLeftIcon,
    Share2,
    Copy,
    ExternalLink,
    Image as ImageIcon,
    QrCode,
    Download
} from 'lucide-react';

// ============================================
// INLINE SVG ICONS
// ============================================
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
    check_in_code: string;
    name: string;
    slug: string;
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
const DEFAULT_MESSAGE = "Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir di acara Pernikahan kami.";

// ============================================
// MAIN COMPONENT
// ============================================
export const GuestManagementPage: React.FC = () => {
    const { invitationId } = useParams<{ invitationId: string }>();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState<any>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
        title: 'Buku Tamu',
        description: 'Kelola daftar tamu undangan digital Anda.',
    });

    // Fetch data
    React.useEffect(() => {
        if (invitationId) {
            fetchData();
        }
    }, [invitationId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [guestList, invData] = await Promise.all([
                guestsApi.list(invitationId!),
                invitationsApi.get(invitationId!)
            ]);
            // Map snake_case from DB if necessary
            const mappedGuests = guestList.map((g: any) => ({
                ...g,
                guestCount: g.guest_count || g.guestCount || 1,
                tableNumber: g.table_number || g.tableNumber || '',
                checkInCode: g.check_in_code || g.checkInCode || '',
                check_in_code: g.check_in_code || g.checkInCode || '',
                slug: g.slug || '',
                sharedAt: g.shared_at || g.sharedAt || null,
                checkedInAt: g.checked_in_at || g.checkedInAt || null,
                checkedOutAt: g.checked_out_at || g.checkedOutAt || null,
            }));
            setGuests(mappedGuests);
            setInvitation(invData);
        } catch (error) {
            console.error('Failed to fetch guest data:', error);
            showToast('Gagal memuat data tamu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Computed
    const filteredGuests = guests.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.phone?.includes(searchQuery) ||
        g.checkInCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.slug.toLowerCase().includes(searchQuery.toLowerCase())
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

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) {
            return '-';
        }
    };

    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedShareGuest, setSelectedShareGuest] = useState<Guest | null>(null);

    const shareWhatsApp = (guest: Guest) => {
        setSelectedShareGuest(guest);
        setShowShareModal(true);
    };

    const executeShareWhatsApp = async (guest: Guest) => {
        if (!invitation) return;
        const phone = guest.phone || '';
        const personalLink = `https://tamuu.id/${invitation.slug}/${guest.slug}-${guest.check_in_code}`;
        const message = `${invitationMessage}\n\nLink Undangan: ${personalLink}`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');

        // Mark as shared in DB
        try {
            const now = new Date().toISOString();
            await guestsApi.update(guest.id, { shared_at: now });
            setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, sharedAt: now } : g));
        } catch (error) {
            console.error('Failed to update share status:', error);
        }
        showToast('WhatsApp dibuka!');
        setShowShareModal(false);
    };

    const handleAddGuest = async () => {
        if (!formData.name || !invitationId) return;
        try {
            const gData = {
                invitation_id: invitationId,
                name: formData.name,
                phone: formData.phone ? normalizePhone(formData.phone) : undefined,
                address: formData.address,
                table_number: formData.tableNumber,
                tier: formData.tier,
                guest_count: formData.guestCount
            };
            const newGuest = await guestsApi.create(gData);
            setGuests(prev => [{
                ...newGuest,
                guestCount: newGuest.guest_count || 1,
                tableNumber: newGuest.table_number || '',
                checkInCode: newGuest.check_in_code || '',
                slug: newGuest.slug || '',
            }, ...prev]);
            setShowAddModal(false);
            setFormData({ name: '', phone: '', address: 'di tempat', tableNumber: '', tier: 'reguler', guestCount: 1 });
            showToast('Tamu berhasil ditambahkan!');
            fetchData();
        } catch (error) {
            console.error('Failed to add guest:', error);
            showToast('Gagal menambah tamu.');
        }
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

    const handleUpdateGuest = async () => {
        if (!editingGuest || !formData.name) return;
        try {
            await guestsApi.update(editingGuest.id, {
                name: formData.name,
                phone: formData.phone ? normalizePhone(formData.phone) : null,
                address: formData.address,
                table_number: formData.tableNumber,
                tier: formData.tier,
                guest_count: formData.guestCount,
            });
            setShowEditModal(false);
            setEditingGuest(null);
            showToast('Data tamu diperbarui!');
            fetchData();
        } catch (error) {
            console.error('Failed to update guest:', error);
            showToast('Gagal memperbarui data.');
        }
    };

    const handleDeleteGuest = (guestId: string) => {
        setGuestToDelete(guestId);
        setShowDeleteModal(true);
    };

    const confirmDeleteGuest = async () => {
        if (!guestToDelete) return;
        setIsDeleting(true);
        try {
            await guestsApi.delete(guestToDelete);
            showToast('Tamu dihapus!');
            setShowDeleteModal(false);
            setGuestToDelete(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete guest:', error);
            showToast('Gagal menghapus tamu.');
        } finally {
            setIsDeleting(false);
        }
    };

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedDownloadGuest, setSelectedDownloadGuest] = useState<Guest | null>(null);

    const handleDownloadCard = (guest: Guest) => {
        setSelectedDownloadGuest(guest);
        setShowDownloadModal(true);
    };

    const handleShowQR = (guest: Guest) => {
        setSelectedQRGuest(guest);
        setShowQRModal(true);
    };

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

    const confirmImport = async (pendingGuests: any[]) => {
        if (!invitationId) return;
        setIsImporting(true);
        try {
            const formattedGuests = pendingGuests.map(ig => ({
                name: ig.name,
                phone: ig.phone ? normalizePhone(ig.phone) : null,
                address: ig.address || 'di tempat',
                table_number: ig.tableNumber || '',
                tier: ig.tier || 'reguler',
                guest_count: ig.guestCount || 1,
            }));

            // Use the API to bulk create
            await guestsApi.bulkCreate(invitationId, formattedGuests);
            
            setShowImportModal(false);
            showToast(`Berhasil mengimpor ${formattedGuests.length} tamu!`);
            fetchData();
        } catch (error) {
            console.error('Failed to import guests:', error);
            showToast('Gagal mengimpor data tamu.');
        } finally {
            setIsImporting(false);
        }
    };

    const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
        const publicDomain = getPublicDomain();
        const exportData = guests.map(g => ({
            'Token/ID': g.checkInCode,
            'Tier': g.tier?.toUpperCase(),
            'Nama': g.name,
            'Slug URL': g.slug,
            'Personal Link': `https://tamuu.id/${invitation?.slug}/${g.slug}-${g.check_in_code}`,
            'WhatsApp': g.phone ? `+${g.phone}` : '-',
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
            XLSX.writeFile(workbook, `export-tamu-${invitationId || 'data'}.xlsx`);
        } else if (format === 'json') {
            const blob = new Blob([JSON.stringify(guests, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `export-tamu-${invitationId || 'data'}.json`;
            link.click();
        } else {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `export-tamu-${invitationId || 'data'}.csv`;
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

    if (isLoading && !guests.length) {
        return (
            <PremiumLoader showLabel label="Memuat Data Tamu..." />
        );
    }

    const publicDomain = getPublicDomain();

    return (
        <div className="min-h-screen bg-slate-50 pt-[140px] md:pt-[130px]">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-200 px-4 lg:px-8 pt-10 pb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-slate-400 hover:text-teal-600 transition-colors mb-4 group">
                            <ArrowLeftIcon className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" /> Kembali
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Buku Tamu Digital</h1>
                        <p className="text-slate-500">Kelola tamu dan kirim undangan personal dengan mudah.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                            <AnimatedCopyIcon 
                                text={`https://${publicDomain}/${invitation?.slug}`} 
                                size={16} 
                                successMessage="Link umum disalin!" 
                            />
                            <span className="text-sm font-medium">Copy General Link</span>
                        </div>
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
                                <p className="text-[10px] text-amber-600 font-bold uppercase mb-0.5">ULTIMATE & ELITE</p>
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-2.5 rounded-[2.5rem] border border-slate-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="relative flex-1 max-w-lg w-full">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari tamu..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border-none rounded-[1.8rem] text-sm font-bold text-[#0A1128] focus:ring-0 transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto pr-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-[#0A1128] text-white rounded-[1.8rem] hover:bg-[#151d3d] transition-all duration-500 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#0A1128]/5 active:scale-95 whitespace-nowrap"
                        >
                            <FileUpIcon className="w-4 h-4 text-teal-400" /> Import Directory
                        </button>

                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-50/50 hover:bg-slate-100/80 border border-transparent text-slate-600 rounded-[1.8rem] transition-all duration-500 font-black text-[10px] uppercase tracking-widest active:scale-95 whitespace-nowrap"
                            >
                                <FileDownIcon className="w-4 h-4" /> Export
                            </button>
                            {showExportDropdown && (
                                <m.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="absolute right-0 top-full mt-3 bg-white/80 backdrop-blur-2xl border border-slate-100 rounded-[2rem] shadow-2xl z-[70] py-3 w-56 overflow-hidden"
                                >
                                    <button onClick={() => handleExport('xlsx')} className="w-full text-left px-6 py-3.5 hover:bg-[#FFBF00]/10 text-xs font-black uppercase tracking-tight text-[#0A1128] flex items-center gap-3 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Excel Spreadsheet
                                    </button>
                                    <button onClick={() => handleExport('csv')} className="w-full text-left px-6 py-3.5 hover:bg-[#FFBF00]/10 text-xs font-black uppercase tracking-tight text-[#0A1128] flex items-center gap-3 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Flat CSV File
                                    </button>
                                    <button onClick={() => handleExport('json')} className="w-full text-left px-6 py-3.5 hover:bg-[#FFBF00]/10 text-xs font-black uppercase tracking-tight text-[#0A1128] flex items-center gap-3 transition-colors border-t border-slate-50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Data JSON
                                    </button>
                                </m.div>
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
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Token/ID</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Tier</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Nama Tamu</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Slug URL</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">No WhatsApp</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Alamat</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap">Meja</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Jumlah</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Status WA</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Check-in</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Check-out</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Kehadiran</th>
                                    <th className="px-4 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredGuests.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="px-6 py-12 text-center text-slate-400 italic">
                                            Belum ada data tamu. Klik "Tambah Tamu" untuk memulai.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGuests.map(guest => (
                                        <tr key={guest.id} className="hover:bg-slate-50 transition-all duration-200">
                                            <td className="px-4 py-4 text-[12px] font-mono text-slate-500 uppercase font-bold">{guest.checkInCode}</td>
                                            <td className="px-4 py-4">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ring-1 ring-inset ${getTierBadge(guest.tier)}`}>
                                                    {guest.tier === 'reguler' ? 'REG' : guest.tier?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-[13px] font-bold text-slate-800">{guest.name}</td>
                                            <td className="px-4 py-4 text-[11px] font-mono text-slate-400 truncate max-w-[150px]">{guest.slug}</td>
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
                                            <td className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 tabular-nums">
                                                {formatTime(guest.checkedInAt)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-[11px] font-bold text-rose-400 tabular-nums">
                                                {formatTime(guest.checkedOutAt)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {guest.checkedInAt ? (
                                                    <span className={`px-2 py-1 text-[9px] font-black rounded-lg ${guest.checkedOutAt ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {guest.checkedOutAt ? 'KELUAR' : 'HADIR'}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-300 text-[9px] font-black rounded-lg">BELUM</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => shareWhatsApp(guest)} className={`p-2 rounded-xl transition-all hover:scale-110 ${guest.sharedAt ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`} title="Kirim WhatsApp">
                                                        {guest.sharedAt ? <CheckIcon className="w-4 h-4" /> : <MessageSquareIcon className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleShowQR(guest)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="QR Code"
                                                    >
                                                        <QrCodeIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadCard(guest)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Download Card"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                    <div className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                                                        <AnimatedCopyIcon 
                                                            text={`https://tamuu.id/${invitation?.slug}/${guest.slug}-${guest.check_in_code}`} 
                                                            size={16} 
                                                            successMessage={`Link untuk ${guest.name} disalin!`} 
                                                        />
                                                    </div>
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
                url={`https://tamuu.id/${invitation?.slug}/${selectedQRGuest?.slug}-${selectedQRGuest?.check_in_code || ''}`}
                tier={selectedQRGuest?.tier}
            />

            <DownloadCardModal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                guest={selectedDownloadGuest}
                invitation={invitation}
                publicDomain={publicDomain}
            />

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDownloadFormat={downloadImportFormat}
                onConfirm={confirmImport}
                isImporting={isImporting}
            />

            {/* Share Preview Modal */}
            <AnimatePresence>
                {showShareModal && selectedShareGuest && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowShareModal(false)} />
                        <m.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                            {/* Preview Side */}
                            <div className="w-full md:w-1/2 bg-slate-100 p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden min-h-[400px]">
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                </div>
                                
                                <div className="flex items-center gap-2 mb-2 z-10">
                                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Preview Kartu (1:1)</span>
                                </div>

                                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden aspect-square w-full max-w-[320px] border border-slate-200">
                                    {/* CSS Card Layout - Elegant Apple Asymmetrical Grid */}
                                    <div className="w-full h-full bg-white flex flex-col p-[10%] relative leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {/* Top Section: Split Layout 65/35 */}
                                        <div className="flex justify-between items-start w-full">
                                            {/* Left Side: Branding & Core Names */}
                                            <div className="flex flex-col items-start w-[65%]">
                                                <img src="/assets/tamuu-logo-header.png" alt="Tamuu" className="w-[22%] opacity-50 grayscale brightness-50 mb-[10%]" />
                                                
                                                {(() => {
                                                    const og = invitation?.og_settings ? (typeof invitation.og_settings === 'string' ? JSON.parse(invitation.og_settings) : invitation.og_settings) : {};
                                                    const names = invitation?.name?.split('&').map((n: string) => n.trim()) || [];
                                                    return (
                                                        <>
                                                            <div className="text-[6px] text-slate-400 uppercase tracking-[8px] font-medium mb-[5%] opacity-80">
                                                                {(og.event || 'THE WEDDING OF').toUpperCase()}
                                                            </div>
                                                            
                                                            <div className="flex flex-col items-start w-full">
                                                                <div className="text-[20px] font-bold text-slate-900 leading-[1.1] tracking-tighter uppercase">
                                                                    {og.n1 || names[0] || 'MEMPELAI 1'}
                                                                </div>
                                                                <div className="text-[14px] text-slate-300 font-extralight my-1">&</div>
                                                                <div className="text-[20px] font-bold text-slate-900 leading-[1.1] tracking-tighter uppercase">
                                                                    {og.n2 || names[1] || 'MEMPELAI 2'}
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            {/* Right Side: Bare QR Anchor */}
                                            <div className="w-[30%] aspect-square flex items-center justify-center pt-2">
                                                <QrCode className="w-full h-full text-slate-800 opacity-90" strokeWidth={1} />
                                            </div>
                                        </div>

                                        {/* Middle Section: Logistics */}
                                        <div className="flex flex-col items-start mt-[10%]">
                                            {(() => {
                                                const og = invitation?.og_settings ? (typeof invitation.og_settings === 'string' ? JSON.parse(invitation.og_settings) : invitation.og_settings) : {};
                                                const dt = og.time || invitation?.event_date || '';
                                                return (
                                                    <div className="flex flex-col gap-1">
                                                        {dt.includes(',') ? dt.split(',').map((part: string, i: number) => (
                                                            <div key={i} className={`uppercase tracking-[2px] ${i === 0 ? 'text-[8px] text-slate-600 font-bold' : 'text-[7px] text-slate-400 font-medium opacity-80'}`}>
                                                                {part.trim()}
                                                            </div>
                                                        )) : (
                                                            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-[2px]">
                                                                {dt || 'EVENT DATE'}
                                                            </div>
                                                        )}
                                                        <div className="text-[7px] text-slate-400 font-normal mt-1 opacity-70 uppercase tracking-[1px]">
                                                            {og.loc || invitation?.venue_name || 'LOCATION'}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Bottom Section: Guest Identity */}
                                        <div className="mt-auto flex flex-col items-start w-full">
                                            <div className="text-[6px] text-slate-400 font-normal uppercase tracking-[3px] mb-1.5 opacity-60">Kepada Yth:</div>
                                            <div className="text-[14px] font-bold text-slate-800 truncate w-full pr-10 uppercase tracking-tight">
                                                {selectedShareGuest?.name || 'TAMU UNDANGAN'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-[10px] text-slate-400 text-center max-w-[250px] leading-relaxed">
                                    Gambar ini akan muncul secara otomatis saat link dikirim melalui WhatsApp.
                                </p>
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col gap-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        <Share2 className="w-4 h-4" /> Sharing Center
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 leading-tight">Kirim Undangan Untuk {selectedShareGuest.name}</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Pratinjau Pesan</label>
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-sm text-slate-600 leading-relaxed italic relative">
                                            <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-2 text-[10px] font-bold text-slate-300 border border-slate-100 rounded">WhatsApp Message</div>
                                            {invitationMessage}
                                            <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-col gap-1 not-italic">
                                                <span className="text-indigo-600 font-bold">Link Undangan:</span>
                                                <span className="text-slate-400 break-all">https://tamuu.id/{invitation?.slug}/{selectedShareGuest.slug}-{selectedShareGuest.check_in_code}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex flex-col gap-3">
                                    <button
                                        onClick={() => executeShareWhatsApp(selectedShareGuest)}
                                        className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                    >
                                        <MessageSquareIcon className="w-6 h-6" />
                                        Buka WhatsApp Sekarang
                                    </button>
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="w-full h-14 bg-white hover:bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-bold uppercase tracking-widest text-[10px] transition-all"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>

                            <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-300">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuestManagementPage;
