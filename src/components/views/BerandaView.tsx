import React from 'react';
import { Announcement, LedgerTransaction } from '../../types';
import { Megaphone, Trash2, Plus, Users, Wallet, FileText, Calendar, Award, PhoneCall, ShieldAlert, TrendingUp, TrendingDown, UserCheck, Clock, Shield, Edit, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Import default assets untuk dokumentasi kegiatan
import kerjaBaktiImg from '../../assets/kerja_bakti.png';
import gotongRoyongImg from '../../assets/gotong_royong.png';
import rondaMalamImg from '../../assets/ronda_malam.png';

/**
 * Interface props untuk BerandaView
 */
export interface BerandaViewProps {
  isAdmin: boolean; // Peran aktif saat ini
  announcements: Announcement[]; // Daftar pengumuman aktif
  onAddAnnouncement: (title: string, content: string, category: 'Penting' | 'Umum' | 'Kegiatan', urgency: 'high' | 'normal') => void; // Aksi posting pengumuman
  onDeleteAnnouncement: (id: number) => void; // Aksi hapus pengumuman
  onEditAnnouncement: (id: number, title: string, content: string, category: 'Penting' | 'Umum' | 'Kegiatan', urgency: 'high' | 'normal') => void; // Aksi edit pengumuman
  activeRtRw: string; // RT/RW terpilih
  totalWarga: number; // Jumlah warga
  kasRT: number; // Kas RT
  poinWarga: number; // Poin partisipasi warga (sistem penghargaan)
  onUpdateStats: (totalWarga: number, kasRT: number, poinWarga: number) => void; // Aksi update statistik oleh admin
  kasLedger: LedgerTransaction[]; // Riwayat transaksi keuangan untuk transparansi kas
  onAddTransaction: (tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => void; // Aksi tambah transaksi
  onEditTransaction: (id: number, tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => void; // Aksi edit transaksi
  onDeleteTransaction: (id: number) => void; // Aksi hapus transaksi
  emergencyContacts: Array<{ id: number; nama: string; nomor: string }>; // Kontak telepon darurat lingkungan
  onAddContact: (nama: string, nomor: string) => void; // Aksi tambah kontak darurat
  onEditContact: (id: number, nama: string, nomor: string) => void; // Aksi edit kontak darurat
  onDeleteContact: (id: number) => void; // Aksi hapus kontak darurat
  jamSampah: string;
  jamOperasional: string;
  onUpdateSchedules: (jamSampah: string, jamOperasional: string) => void;
  pollResults?: { sangat_nyaman: number; biasa_saja: number; cukup_khawatir: number };
  userVoted?: string | null;
  onVoteComfort?: (choice: 'sangat_nyaman' | 'biasa_saja' | 'cukup_khawatir') => void;
}

// Kontak pengurus RT/RW siaga setempat
const officerContacts = [
  { nama: 'Ketua RT (Bp. H. Supardi)', nomor: '0812-3456-7890' },
  { nama: 'Sekretaris RT (Bp. Bambang)', nomor: '0812-5555-4444' },
  { nama: 'Bendahara RT (Ibu Retno)', nomor: '0812-7777-8888' },
];

export const BerandaView: React.FC<BerandaViewProps> = ({
  isAdmin,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onEditAnnouncement,
  activeRtRw,
  totalWarga,
  kasRT,
  poinWarga,
  onUpdateStats,
  kasLedger,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  emergencyContacts,
  onAddContact,
  onEditContact,
  onDeleteContact,
  jamSampah,
  jamOperasional,
  onUpdateSchedules,
  pollResults = { sangat_nyaman: 18, biasa_saja: 11, cukup_khawatir: 5 },
  userVoted = null,
  onVoteComfort,
}) => {
  // State untuk form tambah pengumuman (admin)
  const [judul, setJudul] = React.useState('');
  const [konten, setKonten] = React.useState('');
  const [kategori, setKategori] = React.useState<'Penting' | 'Umum' | 'Kegiatan'>('Umum');
  const [urgensi, setUrgensi] = React.useState<'high' | 'normal'>('normal');

  // State untuk form edit statistik (admin)
  const [wargaInput, setWargaInput] = React.useState(totalWarga.toString());
  const [kasInput, setKasInput] = React.useState(kasRT.toString());
  const [poinInput, setPoinInput] = React.useState(poinWarga.toString());
  const [isEditingStats, setIsEditingStats] = React.useState(false);

  // State Edit Pengumuman Modal
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
  const [editAnnJudul, setEditAnnJudul] = React.useState('');
  const [editAnnKonten, setEditAnnKonten] = React.useState('');
  const [editAnnKategori, setEditAnnKategori] = React.useState<'Penting' | 'Umum' | 'Kegiatan'>('Umum');
  const [editAnnUrgensi, setEditAnnUrgensi] = React.useState<'high' | 'normal'>('normal');

  // State Emergency Contacts CRUD
  const [showAddContactForm, setShowAddContactForm] = React.useState(false);
  const [newContactNama, setNewContactNama] = React.useState('');
  const [newContactNomor, setNewContactNomor] = React.useState('');
  const [editingContact, setEditingContact] = React.useState<{ id: number; nama: string; nomor: string } | null>(null);
  const [editContactNama, setEditContactNama] = React.useState('');
  const [editContactNomor, setEditContactNomor] = React.useState('');

  // State Cash Ledger CRUD
  const [showAddTxForm, setShowAddTxForm] = React.useState(false);
  const [newTxTanggal, setNewTxTanggal] = React.useState('');
  const [newTxKeterangan, setNewTxKeterangan] = React.useState('');
  const [newTxJenis, setNewTxJenis] = React.useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [newTxJumlah, setNewTxJumlah] = React.useState('');
  const [editingTransaction, setEditingTransaction] = React.useState<LedgerTransaction | null>(null);
  const [editTxTanggal, setEditTxTanggal] = React.useState('');
  const [editTxKeterangan, setEditTxKeterangan] = React.useState('');
  const [editTxJenis, setEditTxJenis] = React.useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [editTxJumlah, setEditTxJumlah] = React.useState('');

  // State Interactive Smart Quiz
  const [quizStep, setQuizStep] = React.useState<number>(0); // 0: start, 1: q1, 2: q2, 3: q3, 4: score
  const [quizAnswers, setQuizAnswers] = React.useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = React.useState<boolean>(() => {
    return localStorage.getItem('civic_smart_quiz_completed_june2026') === 'true';
  });
  const [quizScore, setQuizScore] = React.useState<number>(0);

  // Sync state input jika props berubah
  React.useEffect(() => {
    setWargaInput(totalWarga.toString());
    setKasInput(kasRT.toString());
    setPoinInput(poinWarga.toString());
  }, [totalWarga, kasRT, poinWarga]);

  // State untuk dokumentasi kegiatan
  const [photos, setPhotos] = React.useState<Array<{ id: string; url: string; judul: string; tanggal: string }>>(() => {
    // Cek pergantian bulan untuk reset otomatis (LocalStorage month-purging)
    const currentMonthKey = new Date().toISOString().substring(0, 7); // Format: YYYY-MM
    const storedMonthKey = localStorage.getItem('civic_activity_month');
    
    if (storedMonthKey !== currentMonthKey) {
      localStorage.removeItem('civic_activity_photos');
      localStorage.setItem('civic_activity_month', currentMonthKey);
    }

    const storedPhotos = localStorage.getItem('civic_activity_photos');
    if (storedPhotos) {
      try {
        return JSON.parse(storedPhotos);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Fallback awal bulan
    const defaultData = [
      { id: 'def-1', url: kerjaBaktiImg, judul: 'Kerja Bakti Bersih Selokan', tanggal: '05 ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
      { id: 'def-2', url: gotongRoyongImg, judul: 'Pengecatan Balai Warga', tanggal: '12 ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
      { id: 'def-3', url: rondaMalamImg, judul: 'Piket Pos Ronda Kamling', tanggal: '19 ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
      { id: 'def-4', url: kerjaBaktiImg, judul: 'Pembersihan Sampah Liar', tanggal: '08 ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
      { id: 'def-5', url: gotongRoyongImg, judul: 'Gotong Royong Perbaikan Gapura', tanggal: '15 ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
      { id: 'def-6', url: rondaMalamImg, judul: 'Ronda Siaga Keliling Komplek', tanggal: '22 ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) },
    ];
    return defaultData;
  });

  // Sinkronisasi perubahan state ke LocalStorage
  React.useEffect(() => {
    localStorage.setItem('civic_activity_photos', JSON.stringify(photos));
  }, [photos]);

  // Handler Unggah Foto Kegiatan Baru (Admin)
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasan ukuran 2MB agar LocalStorage tidak kuota penuh (limit 5MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran berkas terlalu besar! Maksimal adalah 2MB untuk penyimpanan lokal.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const newPhoto = {
        id: `uploaded-${Date.now()}`,
        url: base64Url,
        judul: (file.name.split('.')[0] || 'Kegiatan Warga').substring(0, 30),
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      };
      setPhotos((prev) => [newPhoto, ...prev]);
      alert('Foto dokumentasi kegiatan berhasil diunggah!');
    };
    reader.readAsDataURL(file);
    // Reset file input value agar berkas yang sama bisa diunggah ulang
    e.target.value = '';
  };

  // Handler Hapus Foto Kegiatan (Admin)
  const handleDeletePhoto = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto dokumentasi kegiatan ini?')) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // State untuk 3-Tab Bulat di bagian bawah
  const [activeSection, setActiveSection] = React.useState<'transparansi' | 'peraturan' | 'kelola'>('transparansi');
  
  // State untuk edit jadwal (admin)
  const [isEditingSchedules, setIsEditingSchedules] = React.useState(false);
  const [inputSampah, setInputSampah] = React.useState(jamSampah);
  const [inputOperasional, setInputOperasional] = React.useState(jamOperasional);

  // Sync schedules input if props change
  React.useEffect(() => {
    setInputSampah(jamSampah);
    setInputOperasional(jamOperasional);
  }, [jamSampah, jamOperasional]);

  const handleSaveSchedules = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSampah.trim() || !inputOperasional.trim()) {
      alert('Harap isi semua jadwal operasional!');
      return;
    }
    onUpdateSchedules(inputSampah.trim(), inputOperasional.trim());
    setIsEditingSchedules(false);
    alert('Jadwal operasional lingkungan berhasil diperbarui!');
  };

  const handleSubmitAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !konten.trim()) return;
    onAddAnnouncement(judul, konten, kategori, urgensi);
    setJudul('');
    setKonten('');
    setKategori('Umum');
    setUrgensi('normal');
    alert('Pengumuman baru berhasil diterbitkan untuk warga!');
  };

  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    const wargaNum = parseInt(wargaInput, 10);
    const kasNum = parseInt(kasInput, 10);
    const poinNum = parseInt(poinInput, 10);
    if (isNaN(wargaNum) || isNaN(kasNum) || isNaN(poinNum)) {
      alert('Harap isi data statistik dengan angka yang valid!');
      return;
    }
    onUpdateStats(wargaNum, kasNum, poinNum);
    setIsEditingStats(false);
    alert('Statistik lingkungan RT/RW berhasil diperbarui!');
  };

  // Format angka rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-800 text-white shadow-md p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
          {isAdmin ? `Selamat Datang, Pengurus ${activeRtRw}!` : `Selamat Datang di Portal Warga ${activeRtRw}!`}
        </h2>
        <p className="text-teal-50/90 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
          {isAdmin 
            ? 'Gunakan dashboard ini untuk mengumumkan kegiatan RT/RW, memverifikasi rumor yang dilaporkan warga, serta merespons aduan di lingkungan Anda secara transparan.'
            : 'Temukan pengumuman terbaru RT/RW, laporkan keluhan lingkungan Anda, lakukan konsultasi otomatis bersama Asisten AI, serta saring hoaks di masyarakat secara mandiri.'}
        </p>
      </div>

      {/* 2. Grid Statistik Terpusat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Statistik Jumlah Warga */}
        <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3.5 bg-teal-100/50 text-teal-855 rounded-2xl shrink-0">
            <Users size={22} className="text-civic-primary" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Penduduk</span>
            {isEditingStats ? (
              <input
                type="number"
                value={wargaInput}
                onChange={(e) => setWargaInput(e.target.value)}
                className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 text-sm mt-1 focus:ring-1 focus:ring-civic-primary focus:outline-none"
              />
            ) : (
              <span className="text-lg font-black text-slate-800">{totalWarga} Jiwa</span>
            )}
          </div>
        </div>

        {/* Statistik Kas Keuangan RT */}
        <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100/50 text-emerald-855 rounded-2xl shrink-0">
            <Wallet size={22} className="text-emerald-700" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Saldo Kas RT</span>
            {isEditingStats ? (
              <input
                type="number"
                value={kasInput}
                onChange={(e) => setKasInput(e.target.value)}
                className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 text-sm mt-1 focus:ring-1 focus:ring-civic-primary focus:outline-none"
              />
            ) : (
              <span className="text-lg font-black text-slate-800">{formatRupiah(kasRT)}</span>
            )}
          </div>
        </div>

        {/* Statistik Poin Partisipasi Warga (Sistem Penghargaan) */}
        <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3.5 bg-amber-100/50 text-amber-800 rounded-2xl shrink-0">
            <Award size={22} className="text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              {isAdmin ? 'Poin Rata-Rata Warga' : 'Poin Partisipasi Anda'}
            </span>
            {isEditingStats ? (
              <input
                type="number"
                value={poinInput}
                onChange={(e) => setPoinInput(e.target.value)}
                className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 text-sm mt-1 focus:ring-1 focus:ring-civic-primary focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-slate-800">{poinWarga} Poin</span>
                {!isAdmin && (
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-sm uppercase tracking-wide">
                    Aktif
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tombol Kontrol Statistik Admin */}
        <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-center shrink-0">
          {isAdmin ? (
            isEditingStats ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleSaveStats}
                  className="flex-1 bg-civic-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-teal-800 transition-all cursor-pointer text-center"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setIsEditingStats(false);
                    setWargaInput(totalWarga.toString());
                    setKasInput(kasRT.toString());
                    setPoinInput(poinWarga.toString());
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingStats(true)}
                className="w-full bg-civic-primary hover:opacity-90 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Ubah Statistik RT
              </button>
            )
          ) : (
            <div className="flex items-center justify-between select-none text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Status Akun</span>
                <span className="font-bold text-slate-700">Warga Terdaftar</span>
              </div>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase">
                Aktif
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Grid Tengah: Pengumuman Terkini (Kiri) & Daftar Kontak (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Daftar Pengumuman (2 Kolom) */}
        <div className="lg:col-span-2 bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 select-none">
            <Megaphone className="text-civic-primary shrink-0" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Pengumuman Warga Terbaru</h3>
          </div>

          {announcements.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileText className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm text-slate-500 font-semibold">Belum ada pengumuman untuk saat ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((item) => {
                const isHighUrgency = item.urgensi === 'high';
                return (
                  <div
                    key={item.id}
                    className={`p-4 bg-slate-50 rounded-xl border transition-all duration-200 ${
                      isHighUrgency 
                        ? 'border-l-4 border-l-rose-500 border-slate-200' 
                        : 'border-l-4 border-l-teal-600 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-sm ${
                          item.kategori === 'Penting' 
                            ? 'bg-rose-100 text-rose-850' 
                            : item.kategori === 'Kegiatan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {item.kategori}
                        </span>
                        {isHighUrgency && (
                          <span className="text-[9px] font-extrabold uppercase bg-rose-650 text-white px-2 py-0.5 rounded-sm">
                            Darurat
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          {item.tanggal}
                        </span>
                        
                        {/* Tombol Aksi (Admin Only) */}
                        {isAdmin && (
                          <div className="flex gap-1.5 items-center select-none">
                            <button
                              onClick={() => {
                                setEditingAnnouncement(item);
                                setEditAnnJudul(item.judul);
                                setEditAnnKonten(item.konten);
                                setEditAnnKategori(item.kategori);
                                setEditAnnUrgensi(item.urgensi);
                              }}
                              className="p-1 rounded text-blue-600 hover:bg-blue-55 cursor-pointer"
                              title="Edit Pengumuman"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                                  onDeleteAnnouncement(item.id);
                                }
                              }}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Pengumuman"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-base mb-1">{item.judul}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">{item.konten}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Aksi Posting Admin ATAU Info Pengurus + Kontak Darurat (1 Kolom) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Aksi Tambah Pengumuman (Admin Only) */}
          {isAdmin && (
            <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Plus className="text-civic-primary" size={20} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Terbitkan Pengumuman</h3>
              </div>

              <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
                <div>
                  <label htmlFor="judul-pengumuman" className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Pengumuman:
                  </label>
                  <input
                    id="judul-pengumuman"
                    type="text"
                    required
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Contoh: Jadwal Ronda Malam Baru"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="kategori-pengumuman" className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori:
                    </label>
                    <select
                      id="kategori-pengumuman"
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-white text-slate-855 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
                    >
                      <option value="Umum">Umum</option>
                      <option value="Penting">Penting</option>
                      <option value="Kegiatan">Kegiatan</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="urgensi-pengumuman" className="block text-xs font-bold text-slate-700 mb-1">
                      Urgensi:
                    </label>
                    <select
                      id="urgensi-pengumuman"
                      value={urgensi}
                      onChange={(e) => setUrgensi(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-white text-slate-855 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">Darurat</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="konten-pengumuman" className="block text-xs font-bold text-slate-700 mb-1">
                    Isi Pengumuman:
                  </label>
                  <textarea
                    id="konten-pengumuman"
                    rows={4}
                    required
                    value={konten}
                    onChange={(e) => setKonten(e.target.value)}
                    placeholder="Tulis rincian pengumuman..."
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-civic-primary hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                >
                  Terbitkan Sekarang
                </button>
              </form>
            </div>
          )}

          {/* Pusat Kontak Darurat RT/RW (Visual dan Premium untuk mengisi space kosong) */}
          <div className="bg-civic-surface border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 select-none">
              <PhoneCall size={16} className="text-rose-600 shrink-0" />
              Pusat Kontak Darurat RT/RW
            </h4>

            {/* Input Tambah Kontak Darurat (Only Admin) */}
            {isAdmin && (
              <div className="mb-4 select-none">
                {showAddContactForm ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newContactNama.trim() && newContactNomor.trim()) {
                        onAddContact(newContactNama.trim(), newContactNomor.trim());
                        setNewContactNama('');
                        setNewContactNomor('');
                        setShowAddContactForm(false);
                        alert('Kontak darurat baru berhasil ditambahkan!');
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs"
                  >
                    <span className="font-bold text-slate-800 block mb-1">Tambah Kontak Darurat Baru</span>
                    <div>
                      <input
                        type="text"
                        placeholder="Nama Instansi/Kontak (eg: Polsek)"
                        value={newContactNama}
                        onChange={(e) => setNewContactNama(e.target.value)}
                        required
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Nomor Telepon (eg: 0811-xxx)"
                        value={newContactNomor}
                        onChange={(e) => setNewContactNomor(e.target.value)}
                        required
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="submit"
                        className="bg-civic-primary hover:opacity-90 text-white font-bold py-1 px-3 rounded-lg cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddContactForm(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-650 font-bold py-1 px-3 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAddContactForm(true)}
                    className="w-full bg-civic-primary/10 hover:bg-civic-primary/20 text-civic-primary text-xs font-bold py-2 rounded-xl border border-dashed border-civic-primary/30 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={12} />
                    Tambah Kontak Darurat
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {emergencyContacts.map((contact) => {
                const isFireOrAmbulance = contact.nama.includes('Pemadam') || contact.nama.includes('Ambulans');
                return (
                  <div key={contact.id} className="p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-2 transition-all hover:shadow-3xs">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block select-none">
                        {contact.nama.includes('RW') || contact.nama.includes('Ketua') ? 'Aparat Desa' : 'Layanan Publik'}
                      </span>
                      <p className="font-extrabold text-slate-750 text-xs mt-0.5 truncate">{contact.nama}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${contact.nomor}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black font-mono transition-colors cursor-pointer ${
                          isFireOrAmbulance
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-civic-primary/10 text-civic-primary hover:bg-civic-primary/20'
                        }`}
                      >
                        <PhoneCall size={10} />
                        {contact.nomor}
                      </a>
                      
                      {isAdmin && (
                        <div className="flex gap-0.5 items-center select-none">
                          <button
                            onClick={() => {
                              setEditingContact(contact);
                              setEditContactNama(contact.nama);
                              setEditContactNomor(contact.nomor);
                            }}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus kontak ${contact.nama}?`)) {
                                onDeleteContact(contact.id);
                              }
                            }}
                            className="p-1 rounded text-rose-500 hover:bg-rose-55 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Survei Kenyamanan & Kesehatan Lingkungan Mingguan */}
          {!isAdmin && (
            <div className="bg-civic-surface border border-slate-200 rounded-2xl p-5 shadow-xs mt-4">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 select-none">
                <Shield size={16} className="text-civic-primary shrink-0" />
                Survei Kenyamanan Lingkungan
              </h4>
              <p className="text-xs text-slate-505 mb-4 font-medium leading-relaxed">
                Bagaimana tingkat/kenyamanan Anda tentang kondisi lingkungan minggu ini? Respon Anda bersifat anonim dan digunakan untuk analisis kesejahteraan warga.
              </p>
              
              {!userVoted ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onVoteComfort?.('sangat_nyaman')}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-teal-650 hover:bg-teal-50/20 text-slate-700 font-bold py-2 px-3 rounded-xl transition-all text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <span>😊 Sangat Nyaman</span>
                  </button>
                  <button
                    onClick={() => onVoteComfort?.('biasa_saja')}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-teal-650 hover:bg-teal-50/20 text-slate-700 font-bold py-2 px-3 rounded-xl transition-all text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <span>😐 Biasa Saja</span>
                  </button>
                  <button
                    onClick={() => onVoteComfort?.('cukup_khawatir')}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-teal-650 hover:bg-teal-50/20 text-slate-700 font-bold py-2 px-3 rounded-xl transition-all text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <span>😨 Cukup Khawatir</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-center select-none">
                  <span className="text-xs font-bold text-emerald-850 block leading-relaxed">
                    ✓ Terima kasih atas partisipasi Anda! Tanggapan Anda telah terkirim secara anonim untuk evaluasi lingkungan.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Smart Quiz Lingkungan (Warga Only) */}
          {!isAdmin && (
            <div className="bg-civic-surface border border-slate-200 rounded-2xl p-5 shadow-xs mt-4">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 select-none">
                <Award size={16} className="text-amber-600 shrink-0" />
                Smart Quiz Lingkungan
              </h4>
              
              {quizCompleted ? (
                <div className="text-center py-4 space-y-2 select-none">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-3xs">
                    <Check size={20} className="text-amber-600" />
                  </div>
                  <h5 className="font-bold text-slate-805 text-sm">Quiz Hari Ini Selesai!</h5>
                  <p className="text-xs text-slate-500 font-medium">
                    Terima kasih telah berpartisipasi menjaga kebersihan dan ketertiban. Poin partisipasi Anda telah ditambahkan (+15 poin).
                  </p>
                </div>
              ) : quizStep === 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-505 leading-relaxed font-medium">
                    Uji pengetahuan lingkungan Anda tentang pengelolaan sampah, jam tenang, dan kesehatan lingkungan untuk memenangkan **+15 poin keaktifan warga**!
                  </p>
                  <button
                    onClick={() => {
                      setQuizStep(1);
                      setQuizAnswers({});
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl transition-all text-xs text-center cursor-pointer shadow-3xs"
                  >
                    Mulai Quiz Lingkungan
                  </button>
                </div>
              ) : quizStep >= 1 && quizStep <= 3 ? (
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="flex justify-between items-center text-[10px] text-slate-450 font-extrabold select-none">
                    <span>PERTANYAAN {quizStep} DARI 3</span>
                    <span>{Math.round(((quizStep - 1) / 3) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(quizStep / 3) * 100}%` }} />
                  </div>

                  {/* Pertanyaan & Pilihan */}
                  {quizStep === 1 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-800 leading-normal">
                        1. Bagaimana cara membuang sampah baterai bekas dan limbah elektronik rumah tangga yang benar?
                      </p>
                      <div className="flex flex-col gap-2">
                        {[
                          { key: 'A', text: 'A. Dibuang bersama sampah plastik agar mudah disortir' },
                          { key: 'B', text: 'B. Dibuang ke tong sampah organik agar lekas busuk' },
                          { key: 'C', text: 'C. Dipisahkan sebagai limbah B3 (bahan berbahaya & beracun) dan diserahkan ke TPS resmi' }
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, 1: opt.key }))}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              quizAnswers[1] === opt.key
                                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-3xs'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700'
                            }`}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {quizStep === 2 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-800 leading-normal">
                        2. Berdasarkan kesepakatan tata tertib RT/RW kita, berapa batas toleransi kebisingan (jam tenang) lingkungan?
                      </p>
                      <div className="flex flex-col gap-2">
                        {[
                          { key: 'A', text: 'A. Pukul 20:00 WIB' },
                          { key: 'B', text: 'B. Pukul 22:00 WIB' },
                          { key: 'C', text: 'C. Pukul 24:00 WIB' }
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, 2: opt.key }))}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              quizAnswers[2] === opt.key
                                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-3xs'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700'
                            }`}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {quizStep === 3 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-800 leading-normal">
                        3. Apa langkah pencegahan penyakit demam berdarah (DBD) paling efektif di lingkungan rumah tangga?
                      </p>
                      <div className="flex flex-col gap-2">
                        {[
                          { key: 'A', text: 'A. Menutup semua pintu dan jendela setiap jam' },
                          { key: 'B', text: 'B. Gerakan 3M Plus (Menguras, Menutup tempat air, Mendaur ulang barang bekas)' },
                          { key: 'C', text: 'C. Menyemprotkan obat nyamuk semprot beraroma kimia setiap satu jam' }
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, 3: opt.key }))}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              quizAnswers[3] === opt.key
                                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-3xs'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700'
                            }`}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigasi / Kirim */}
                  <div className="flex gap-2 justify-end pt-1 select-none">
                    {quizStep > 1 && (
                      <button
                        onClick={() => setQuizStep(prev => prev - 1)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-650 text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                      >
                        Kembali
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // Cek apakah sudah dijawab untuk step ini
                        if (!quizAnswers[quizStep]) {
                          alert('Harap pilih salah satu jawaban terlebih dahulu!');
                          return;
                        }
                        if (quizStep < 3) {
                          setQuizStep(prev => prev + 1);
                        } else {
                          // Koreksi jawaban
                          let score = 0;
                          if (quizAnswers[1] === 'C') score++;
                          if (quizAnswers[2] === 'B') score++;
                          if (quizAnswers[3] === 'B') score++;
                          
                          setQuizScore(score);
                          setQuizStep(4);
                          
                          if (score === 3) {
                            // Update poin
                            onUpdateStats(totalWarga, kasRT, poinWarga + 15);
                            setQuizCompleted(true);
                            localStorage.setItem('civic_smart_quiz_completed_june2026', 'true');
                            alert('Luar biasa! Semua jawaban Anda benar. Anda memenangkan +15 poin partisipasi warga!');
                          }
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                    >
                      {quizStep === 3 ? 'Kirim Jawaban' : 'Selanjutnya'}
                    </button>
                  </div>
                </div>
              ) : (
                /* score < 3 retry view */
                <div className="text-center py-2 space-y-3 select-none">
                  <div className="w-10 h-10 rounded-full bg-rose-105 text-rose-800 flex items-center justify-center mx-auto shadow-3xs">
                    <X size={20} className="text-rose-600" />
                  </div>
                  <h5 className="font-bold text-slate-805 text-sm">Skor Anda: {quizScore} / 3</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Sayang sekali! Anda harus menjawab seluruh pertanyaan dengan benar untuk mendapatkan poin keaktifan warga. Silakan coba kembali!
                  </p>
                  <button
                    onClick={() => {
                      setQuizStep(1);
                      setQuizAnswers({});
                      setQuizScore(0);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl transition-all text-xs text-center cursor-pointer shadow-3xs"
                  >
                    Ulangi Quiz
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 
        4. FULL-WIDTH: 3-TAB CONTAINER LINGKUNGAN (TRANSPARANSI, PERATURAN, KELOLA)
        Menggunakan navigasi tabs meluncur (expandable-style) untuk memilih data yang ditampilkan,
        menyediakan akses informasi kependudukan terpadu secara modern.
      */}
      <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 w-full">
        
        <Tabs value={activeSection} onValueChange={(val) => {
          setActiveSection(val as any);
          setIsEditingSchedules(false);
        }} className="w-full">
          {/* Tabs List Bulat */}
          <div className="flex justify-center mb-6 select-none">
            <TabsList className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-2xs max-w-max">
              <TabsTrigger
                value="transparansi"
                className="group relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold transition-all duration-300 cursor-pointer text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 data-[state=active]:bg-white data-[state=active]:text-civic-primary data-[state=active]:shadow-3xs"
              >
                <Wallet size={16} />
                <span className="overflow-hidden transition-all duration-300 whitespace-nowrap max-w-0 opacity-0 group-data-[state=active]:max-w-[150px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-0.5">
                  Transparansi Kas
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="peraturan"
                className="group relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold transition-all duration-300 cursor-pointer text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 data-[state=active]:bg-white data-[state=active]:text-civic-primary data-[state=active]:shadow-3xs"
              >
                <Shield size={16} />
                <span className="overflow-hidden transition-all duration-300 whitespace-nowrap max-w-0 opacity-0 group-data-[state=active]:max-w-[150px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-0.5">
                  Kebijakan & Peraturan
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="kelola"
                className="group relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold transition-all duration-300 cursor-pointer text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 data-[state=active]:bg-white data-[state=active]:text-civic-primary data-[state=active]:shadow-3xs"
              >
                <Calendar size={16} />
                <span className="overflow-hidden transition-all duration-300 whitespace-nowrap max-w-0 opacity-0 group-data-[state=active]:max-w-[150px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-0.5">
                  Kelola Lingkungan
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ======================== TAB CONTENT: TRANSPARANSI ================== */}
          <TabsContent value="transparansi" className="focus:outline-none">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 select-none">
                <div className="flex items-center gap-2.5">
                  <Wallet className="text-civic-primary shrink-0" size={20} />
                  <h3 className="text-sm md:text-base font-extrabold text-slate-805">Transparansi Laporan Keuangan RT</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-extrabold">Periode: Juni 2026</span>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddTxForm(!showAddTxForm)}
                      className="bg-civic-primary hover:opacity-90 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      Tambah Transaksi
                    </button>
                  )}
                </div>
              </div>

              {/* Form Tambah Transaksi Kas (Admin Only) */}
              {isAdmin && showAddTxForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const parsedJumlah = parseInt(newTxJumlah, 10);
                    if (newTxTanggal.trim() && newTxKeterangan.trim() && !isNaN(parsedJumlah)) {
                      onAddTransaction(newTxTanggal.trim(), newTxKeterangan.trim(), newTxJenis, parsedJumlah);
                      setNewTxTanggal('');
                      setNewTxKeterangan('');
                      setNewTxJumlah('');
                      setShowAddTxForm(false);
                      alert('Transaksi baru berhasil ditambahkan!');
                    } else {
                      alert('Harap isi data transaksi dengan valid!');
                    }
                  }}
                  className="bg-slate-50 border border-slate-205 rounded-2xl p-4 mb-4 space-y-3.5 text-xs select-none shadow-3xs animate-fade-in"
                >
                  <span className="block font-bold text-slate-800 text-xs">Pencatatan Transaksi Kas Baru</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tanggal:</label>
                      <input
                        type="text"
                        placeholder="Contoh: 20 Juni 2026"
                        required
                        value={newTxTanggal}
                        onChange={(e) => setNewTxTanggal(e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Keterangan Transaksi:</label>
                      <input
                        type="text"
                        placeholder="Contoh: Iuran Keamanan"
                        required
                        value={newTxKeterangan}
                        onChange={(e) => setNewTxKeterangan(e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jenis:</label>
                      <select
                        value={newTxJenis}
                        onChange={(e) => setNewTxJenis(e.target.value as any)}
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="pemasukan">Pemasukan (Kas Bertambah)</option>
                        <option value="pengeluaran">Pengeluaran (Kas Berkurang)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jumlah (Rupiah):</label>
                      <input
                        type="number"
                        placeholder="Contoh: 500000"
                        required
                        value={newTxJumlah}
                        onChange={(e) => setNewTxJumlah(e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-civic-primary hover:opacity-90 text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer"
                    >
                      Simpan Transaksi
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTxForm(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-655 font-bold py-1.5 px-4 rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-450 text-[10px] uppercase font-extrabold tracking-wider">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Keterangan Transaksi</th>
                      <th className="py-2.5 px-3 text-center">Jenis</th>
                      <th className="py-2.5 px-3 text-right">Jumlah</th>
                      {isAdmin && <th className="py-2.5 px-3 text-center select-none">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                    {kasLedger.map((tx) => {
                      const isIncome = tx.jenis === 'pemasukan';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 text-slate-450 font-medium whitespace-nowrap">{tx.tanggal}</td>
                          <td className="py-3 px-3 font-extrabold text-slate-800">{tx.keterangan}</td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isIncome 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isIncome ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {tx.jenis}
                            </span>
                          </td>
                          <td className={`py-3 px-3 text-right font-black whitespace-nowrap ${
                            isIncome ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {isIncome ? '+' : '-'} {formatRupiah(tx.jumlah)}
                          </td>
                          {isAdmin && (
                            <td className="py-3 px-3 text-center whitespace-nowrap select-none">
                              <div className="flex gap-1.5 justify-center items-center">
                                <button
                                  onClick={() => {
                                    setEditingTransaction(tx);
                                    setEditTxTanggal(tx.tanggal);
                                    setEditTxKeterangan(tx.keterangan);
                                    setEditTxJenis(tx.jenis);
                                    setEditTxJumlah(tx.jumlah.toString());
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer animate-fade-in"
                                  title="Edit Transaksi"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Yakin ingin menghapus transaksi "${tx.keterangan}"?`)) {
                                      onDeleteTransaction(tx.id);
                                    }
                                  }}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer animate-fade-in"
                                  title="Hapus Transaksi"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 flex items-center justify-between mt-4 select-none">
                <span className="text-xs text-slate-500 font-extrabold">Total Laporan Saldo Buku Kas RT:</span>
                <span className="text-sm md:text-base font-black text-slate-800">{formatRupiah(kasRT)}</span>
              </div>
            </div>
          </TabsContent>

          {/* ======================== TAB CONTENT: PERATURAN ======================== */}
          <TabsContent value="peraturan" className="focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 select-none">
                <div className="flex items-center gap-2.5">
                  <Shield className="text-civic-primary shrink-0" size={20} />
                  <h3 className="text-sm md:text-base font-extrabold text-slate-800">Kebijakan & Peraturan Lingkungan RT</h3>
                </div>
                <span className="text-xs text-slate-400 font-extrabold">Terakhir Diperbarui: Juni 2026</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-civic-primary/10 text-civic-primary flex items-center justify-center font-black text-xs shrink-0 select-none mt-0.5">1</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Wajib Lapor Tamu 24 Jam</h4>
                    <p className="text-xs text-slate-500 mt-1 font-bold leading-relaxed">Setiap tamu yang menginap lebih dari 1x24 jam wajib melaporkan diri kepada pengurus RT/RW melalui WhatsApp atau menu aduan dengan melampirkan identitas diri.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-civic-primary/10 text-civic-primary flex items-center justify-center font-black text-xs shrink-0 select-none mt-0.5">2</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Jam Tenang Lingkungan</h4>
                    <p className="text-xs text-slate-500 mt-1 font-bold leading-relaxed">Batas toleransi kebisingan atau kegiatan sosial kemasyarakatan yang menimbulkan keramaian maksimal pukul 22:00 WIB demi kenyamanan warga sekitar.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-civic-primary/10 text-civic-primary flex items-center justify-center font-black text-xs shrink-0 select-none mt-0.5">3</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Ketentuan Sampah Rumah Tangga</h4>
                    <p className="text-xs text-slate-500 mt-1 font-bold leading-relaxed">Sampah harus diletakkan di tempat pembuangan depan rumah dalam kondisi terbungkus rapi sebelum jam operasional truk pengangkut kebersihan kelurahan.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-civic-primary/10 text-civic-primary flex items-center justify-center font-black text-xs shrink-0 select-none mt-0.5">4</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Partisipasi Ronda & Keamanan</h4>
                    <p className="text-xs text-slate-500 mt-1 font-bold leading-relaxed">Warga pria dewasa wajib berpartisipasi menjaga keamanan lingkungan melalui piket ronda malam bergilir di Pos Kamling sesuai jadwal kelompok.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ======================== TAB CONTENT: KELOLA ======================== */}
          <TabsContent value="kelola" className="focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 select-none">
                <div className="flex items-center gap-2.5">
                  <Calendar className="text-civic-primary shrink-0" size={20} />
                  <h3 className="text-sm md:text-base font-extrabold text-slate-800">Kelola Jadwal & Operasional RT</h3>
                </div>
                {isAdmin && !isEditingSchedules && (
                  <button
                    onClick={() => setIsEditingSchedules(true)}
                    className="bg-civic-primary text-white text-xs font-bold py-1.5 px-3.5 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Edit Jadwal Operasional
                  </button>
                )}
              </div>

              {isEditingSchedules ? (
                <form onSubmit={handleSaveSchedules} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider select-none">Ubah Parameter Operasional (Admin Only)</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="input-sampah" className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Pengambilan Sampah:
                      </label>
                      <input
                        id="input-sampah"
                        type="text"
                        value={inputSampah}
                        onChange={(e) => setInputSampah(e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2 text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary font-bold"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="input-op" className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Operasional RT/RW (Tatap Muka):
                      </label>
                      <input
                        id="input-op"
                        type="text"
                        value={inputOperasional}
                        onChange={(e) => setInputOperasional(e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2 text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end select-none">
                    <button
                      type="submit"
                      className="bg-civic-primary text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Simpan Parameter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingSchedules(false);
                        setInputSampah(jamSampah);
                        setInputOperasional(jamOperasional);
                      }}
                      className="bg-slate-200 text-slate-650 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-slate-300"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* 1. Jadwal Ronda */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm mb-3 pb-1 border-b border-slate-150 flex items-center gap-1.5 select-none">
                        <UserCheck size={16} className="text-civic-primary shrink-0" />
                        Jadwal Ronda Malam Aktif
                      </h4>
                      <ul className="space-y-2 text-xs">
                        <li className="flex justify-between font-bold"><span className="text-slate-400">Senin:</span> <span className="text-slate-700">Kelompok 1 (Budi, Joko, Yanto)</span></li>
                        <li className="flex justify-between font-bold"><span className="text-slate-400">Selasa:</span> <span className="text-slate-700">Kelompok 2 (Ahmad, Danu, Rizal)</span></li>
                        <li className="flex justify-between font-bold"><span className="text-slate-400">Rabu:</span> <span className="text-slate-700">Kelompok 3 (Hendry, Tono, Rudi)</span></li>
                        <li className="flex justify-between font-bold"><span className="text-slate-400">Kamis:</span> <span className="text-slate-700">Kelompok 4 (Agus, Slamet, Adi)</span></li>
                        <li className="flex justify-between font-bold"><span className="text-slate-400">Jumat:</span> <span className="text-slate-700">Kelompok 5 (Mulyadi, Retno, Eko)</span></li>
                      </ul>
                    </div>
                    <span className="block text-[9px] text-slate-400 font-extrabold uppercase mt-4 tracking-wider select-none">Berganti Pukul 22:00 WIB</span>
                  </div>

                  {/* 2. Jam Pengambilan Sampah */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm mb-2 flex items-center gap-1.5 select-none">
                        <Clock size={16} className="text-civic-primary shrink-0" />
                        Jam Pengambilan Sampah
                      </h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        Truk dinas kebersihan dan pengumpulan sampah komplek beroperasi keliling pada:
                      </p>
                    </div>
                    <div className="mt-6 p-3 bg-civic-primary/10 border border-civic-primary/20 rounded-xl text-center">
                      <span className="text-base font-black text-civic-primary font-mono">{jamSampah}</span>
                    </div>
                  </div>

                  {/* 3. Jam Operasional RT/RW */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm mb-2 flex items-center gap-1.5 select-none">
                        <Clock size={16} className="text-emerald-700 shrink-0" />
                        Layanan Tatap Muka RT/RW
                      </h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        Pengurusan administrasi kependudukan manual dan tanda tangan basah di balai RT/RW:
                      </p>
                    </div>
                    <div className="mt-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                      <span className="text-xs font-black text-emerald-800">{jamOperasional}</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 
        5. DOKUMENTASI KEGIATAN WARGA (INFINITE MARQUEE CAROUSEL)
        Menampilkan dokumentasi visual aktivitas gotong royong dan kemasyarakatan bulanan.
        Menggunakan LocalStorage dan akan terhapus otomatis di awal bulan baru.
      */}
      <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 w-full space-y-4 overflow-hidden">
        
        {/* Header Seksi */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 select-none">
          <div className="flex items-center gap-2.5">
            <Calendar className="text-civic-primary shrink-0" size={20} />
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-800">Dokumentasi Kegiatan Warga</h3>
              <p className="text-xs text-slate-450 mt-0.5">Koleksi foto kerja bakti dan gotong royong warga bulan ini.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-2.5 py-1.5 rounded-xl border border-teal-200 uppercase">
              Bulan: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            
            {/* Input Tambah Foto (Hanya Admin) */}
            {isAdmin && (
              <label className="bg-civic-primary hover:opacity-90 text-white text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 select-none">
                <Plus size={14} className="shrink-0" />
                Unggah Dokumentasi
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Info/Warning reset otomatis */}
        <p className="text-[10px] text-slate-400 font-bold select-none leading-relaxed">
          * Sistem secara otomatis menghapus seluruh dokumentasi ini pada pergantian bulan (setiap tanggal 1) untuk mengosongkan memori penyimpanan lokal.
        </p>

        {/* Container Marquee */}
        {photos.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 select-none">
            <FileText className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-sm text-slate-500 font-semibold">Belum ada dokumentasi kegiatan untuk bulan ini.</p>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden rounded-2xl bg-slate-50 py-4 border border-slate-100">
            {/* Gradien Bayangan di Sisi Kiri & Kanan (Fade overlay untuk estetika premium) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            {/* Jalur Animasi Gerak */}
            <div className="flex animate-marquee gap-4 hover:[animation-play-state:paused] transition-all duration-300">
              {[...photos, ...photos].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="relative w-64 md:w-80 h-44 md:h-52 rounded-xl overflow-hidden border border-slate-250 shadow-2xs group shrink-0 select-none bg-white"
                >
                  <img
                    src={item.url}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    draggable="false"
                  />
                  
                  {/* Overlay Deskripsi */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-3.5 flex flex-col justify-end text-white">
                    <p className="text-[10px] font-bold text-teal-300">{item.tanggal}</p>
                    <h4 className="font-extrabold text-sm md:text-base mt-0.5 truncate">{item.judul}</h4>
                  </div>

                  {/* Tombol Hapus (Admin Only) */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeletePhoto(item.id)}
                      className="absolute top-2.5 right-2.5 p-2 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-sm hover:bg-rose-700 animate-fade-in"
                      title="Hapus Foto"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 1. Modal Edit Pengumuman */}
      {isAdmin && editingAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-805">Edit Pengumuman</h3>
              <button 
                onClick={() => { setEditingAnnouncement(null); }}
                className="text-slate-400 hover:text-slate-655 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editAnnJudul.trim() && editAnnKonten.trim()) {
                  onEditAnnouncement(editingAnnouncement.id, editAnnJudul.trim(), editAnnKonten.trim(), editAnnKategori, editAnnUrgensi);
                  setEditingAnnouncement(null);
                  alert('Pengumuman berhasil diperbarui!');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  required
                  value={editAnnJudul}
                  onChange={(e) => setEditAnnJudul(e.target.value)}
                  className="w-full border border-slate-305 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori:</label>
                  <select
                    value={editAnnKategori}
                    onChange={(e) => setEditAnnKategori(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Penting">Penting</option>
                    <option value="Kegiatan">Kegiatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urgensi:</label>
                  <select
                    value={editAnnUrgensi}
                    onChange={(e) => setEditAnnUrgensi(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Darurat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pengumuman:</label>
                <textarea
                  rows={4}
                  required
                  value={editAnnKonten}
                  onChange={(e) => setEditAnnKonten(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-civic-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-655 font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Edit Kontak Darurat */}
      {isAdmin && editingContact && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-805">Edit Kontak Darurat</h3>
              <button 
                onClick={() => { setEditingContact(null); }}
                className="text-slate-400 hover:text-slate-655 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editContactNama.trim() && editContactNomor.trim()) {
                  onEditContact(editingContact.id, editContactNama.trim(), editContactNomor.trim());
                  setEditingContact(null);
                  alert('Kontak darurat berhasil diperbarui!');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Instansi/Kontak:</label>
                <input
                  type="text"
                  required
                  value={editContactNama}
                  onChange={(e) => setEditContactNama(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon:</label>
                <input
                  type="text"
                  required
                  value={editContactNomor}
                  onChange={(e) => setEditContactNomor(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-850 font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-civic-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-655 font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Edit Transaksi Kas */}
      {isAdmin && editingTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-805">Edit Catatan Keuangan</h3>
              <button 
                onClick={() => { setEditingTransaction(null); }}
                className="text-slate-400 hover:text-slate-655 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsedJumlah = parseInt(editTxJumlah, 10);
                if (editTxTanggal.trim() && editTxKeterangan.trim() && !isNaN(parsedJumlah)) {
                  onEditTransaction(editingTransaction.id, editTxTanggal.trim(), editTxKeterangan.trim(), editTxJenis, parsedJumlah);
                  setEditingTransaction(null);
                  alert('Catatan transaksi kas berhasil diperbarui!');
                } else {
                  alert('Harap isi data transaksi dengan valid!');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal:</label>
                  <input
                    type="text"
                    required
                    value={editTxTanggal}
                    onChange={(e) => setEditTxTanggal(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Transaksi:</label>
                  <select
                    value={editTxJenis}
                    onChange={(e) => setEditTxJenis(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="pemasukan">Pemasukan (Kas Bertambah)</option>
                    <option value="pengeluaran">Pengeluaran (Kas Berkurang)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Transaksi:</label>
                <input
                  type="text"
                  required
                  value={editTxKeterangan}
                  onChange={(e) => setEditTxKeterangan(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah (Rupiah):</label>
                <input
                  type="number"
                  required
                  value={editTxJumlah}
                  onChange={(e) => setEditTxJumlah(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-bold focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-civic-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-655 font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
