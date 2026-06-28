import React from 'react';
import type { Announcement, LedgerTransaction } from '../../types';
import { Trash2, Plus, Users, Wallet, FileText, Calendar, Award, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Import default activity images
import kerjaBaktiImg from '../../assets/kerja_bakti.png';
import gotongRoyongImg from '../../assets/gotong_royong.png';
import rondaMalamImg from '../../assets/ronda_malam.png';

// Import subcomponents modular
import { QuizWidget } from './beranda/QuizWidget';
import { TransparansiTab } from './beranda/TransparansiTab';
import { KelolaRtTab } from './beranda/KelolaRtTab';
import { AnnouncementsList, AddAnnouncementForm } from './beranda/AnnouncementsSection';

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
  currentUser?: any;
  quizQuestions?: any[];
  pointsPerQuestion?: number;
  onAddQuizQuestion?: (question: string, options: Array<{ key: string; text: string }>, correctAnswer: string) => void;
  onDeleteQuizQuestion?: (id: number) => void;
  onUpdatePointsPerQuestion?: (points: number) => void;
  onUpdateCitizenPoints?: (userId: string, points: number) => void;
}

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
  userVoted = null,
  onVoteComfort,
  currentUser,
  quizQuestions = [],
  pointsPerQuestion = 5,
  onAddQuizQuestion,
  onDeleteQuizQuestion,
  onUpdatePointsPerQuestion,
  onUpdateCitizenPoints,
}) => {
  // State untuk form edit statistik (admin)
  const [wargaInput, setWargaInput] = React.useState(totalWarga.toString());
  const [kasInput, setKasInput] = React.useState(kasRT.toString());
  const [poinInput, setPoinInput] = React.useState(poinWarga.toString());
  const [isEditingStats, setIsEditingStats] = React.useState(false);

  // State untuk 3-Tab Bulat di bagian bawah
  const [activeSection, setActiveSection] = React.useState<'transparansi' | 'peraturan' | 'kelola'>('transparansi');

  // Sync state input jika props berubah
  React.useEffect(() => {
    setWargaInput(totalWarga.toString());
    setKasInput(kasRT.toString());
    setPoinInput(poinWarga.toString());
  }, [totalWarga, kasRT, poinWarga]);

  // State untuk dokumentasi kegiatan dengan migrasi otomatis path gambar yang usang
  const [photos, setPhotos] = React.useState<Array<{ id: string; url: string; judul: string; tanggal: string }>>(() => {
    const currentMonthKey = new Date().toISOString().substring(0, 7); // Format: YYYY-MM
    const storedMonthKey = localStorage.getItem('civic_activity_month');
    
    if (storedMonthKey !== currentMonthKey) {
      localStorage.removeItem('civic_activity_photos');
      localStorage.setItem('civic_activity_month', currentMonthKey);
    }

    const storedPhotos = localStorage.getItem('civic_activity_photos');
    if (storedPhotos) {
      try {
        const parsed = JSON.parse(storedPhotos);
        // Migrasi URL gambar lama agar selalu merujuk ke path static bundle yang aktif di versi produksi
        return parsed.map((photo: any) => {
          if (photo.id === 'def-1' || photo.id === 'def-4' || (typeof photo.url === 'string' && (photo.url.includes('kerja_bakti.png') || photo.url.includes('kerja_bakti-')))) {
            return { ...photo, url: kerjaBaktiImg };
          }
          if (photo.id === 'def-2' || photo.id === 'def-5' || (typeof photo.url === 'string' && (photo.url.includes('gotong_royong.png') || photo.url.includes('gotong_royong-')))) {
            return { ...photo, url: gotongRoyongImg };
          }
          if (photo.id === 'def-3' || photo.id === 'def-6' || (typeof photo.url === 'string' && (photo.url.includes('ronda_malam.png') || photo.url.includes('ronda_malam-')))) {
            return { ...photo, url: rondaMalamImg };
          }
          return photo;
        });
      } catch (e) {
        console.error(e);
      }
    }
    
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

  // Sinkronisasi perubahan state ke LocalStorage dengan pengaman try-catch (limit 5MB)
  React.useEffect(() => {
    try {
      localStorage.setItem('civic_activity_photos', JSON.stringify(photos));
    } catch (e) {
      console.error('Penyimpanan lokal penuh!', e);
    }
  }, [photos]);

  // Handler Unggah Foto Kegiatan Baru (Admin)
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    e.target.value = '';
  };

  // Handler Hapus Foto Kegiatan (Admin)
  const handleDeletePhoto = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto dokumentasi kegiatan ini?')) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
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
                className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 text-sm mt-1 focus:ring-1 focus:ring-civic-primary focus:outline-none bg-slate-100"
                autoComplete="off"
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
                className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 text-sm mt-1 focus:ring-1 focus:ring-civic-primary focus:outline-none bg-slate-100"
                autoComplete="off"
              />
            ) : (
              <span className="text-lg font-black text-slate-800">{formatRupiah(kasRT)}</span>
            )}
          </div>
        </div>

        {/* Statistik Poin Partisipasi Warga */}
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
                className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 text-sm mt-1 focus:ring-1 focus:ring-civic-primary focus:outline-none bg-slate-100"
                autoComplete="off"
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
                  className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-655 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
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
        {/* Kolom Kiri: Daftar Pengumuman */}
        <AnnouncementsList
          isAdmin={isAdmin}
          announcements={announcements}
          onDeleteAnnouncement={onDeleteAnnouncement}
          onEditAnnouncement={onEditAnnouncement}
        />

        {/* Kolom Kanan: Aksi Posting Admin + Quiz/Survey */}
        <div className="lg:col-span-1 space-y-6">
          {isAdmin && (
            <AddAnnouncementForm onAddAnnouncement={onAddAnnouncement} />
          )}

          {/* Smart Quiz Lingkungan */}
          <QuizWidget
            isAdmin={isAdmin}
            currentUser={currentUser}
            quizQuestions={quizQuestions}
            pointsPerQuestion={pointsPerQuestion}
            onAddQuizQuestion={onAddQuizQuestion}
            onDeleteQuizQuestion={onDeleteQuizQuestion}
            onUpdatePointsPerQuestion={onUpdatePointsPerQuestion}
            onUpdateCitizenPoints={onUpdateCitizenPoints}
          />

          {/* Survei Kenyamanan & Kesehatan Lingkungan Mingguan */}
          {!isAdmin && (
            <div className="bg-civic-surface border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 select-none">
                <Shield size={16} className="text-civic-primary shrink-0" />
                Survei Kenyamanan Lingkungan
              </h4>
              <p className="text-xs text-slate-555 mb-4 font-medium leading-relaxed">
                Bagaimana tingkat kenyamanan Anda tentang kondisi lingkungan minggu ini? Respon Anda bersifat anonim.
              </p>
              
              {!userVoted ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onVoteComfort?.('sangat_nyaman')}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-teal-650 hover:bg-teal-55/20 text-slate-700 font-bold py-2 px-3 rounded-xl transition-all text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <span>😊 Sangat Nyaman</span>
                  </button>
                  <button
                    onClick={() => onVoteComfort?.('biasa_saja')}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-teal-650 hover:bg-teal-55/20 text-slate-700 font-bold py-2 px-3 rounded-xl transition-all text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <span>😐 Biasa Saja</span>
                  </button>
                  <button
                    onClick={() => onVoteComfort?.('cukup_khawatir')}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-teal-650 hover:bg-teal-55/20 text-slate-700 font-bold py-2 px-3 rounded-xl transition-all text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <span>😨 Cukup Khawatir</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-center select-none">
                  <span className="text-xs font-bold text-emerald-850 block leading-relaxed">
                    ✓ Terima kasih atas partisipasi Anda!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. FULL-WIDTH: 3-TAB CONTAINER LINGKUNGAN */}
      <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 w-full">
        <Tabs value={activeSection} onValueChange={(val) => setActiveSection(val as any)} className="w-full">
          {/* Tabs List Bulat */}
          <div className="flex justify-center mb-6 select-none">
            <TabsList className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-2xs max-w-max">
              <TabsTrigger
                value="transparansi"
                className="group relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold transition-all duration-300 cursor-pointer text-slate-505 hover:text-slate-800 hover:bg-slate-100/50 data-[state=active]:bg-white data-[state=active]:text-civic-primary data-[state=active]:shadow-3xs"
              >
                <Wallet size={16} />
                <span className="overflow-hidden transition-all duration-300 whitespace-nowrap max-w-0 opacity-0 group-data-[state=active]:max-w-[150px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-0.5">
                  Transparansi Kas
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="peraturan"
                className="group relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold transition-all duration-300 cursor-pointer text-slate-505 hover:text-slate-800 hover:bg-slate-100/50 data-[state=active]:bg-white data-[state=active]:text-civic-primary data-[state=active]:shadow-3xs"
              >
                <Shield size={16} />
                <span className="overflow-hidden transition-all duration-300 whitespace-nowrap max-w-0 opacity-0 group-data-[state=active]:max-w-[150px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-0.5">
                  Kebijakan & Peraturan
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="kelola"
                className="group relative flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold transition-all duration-300 cursor-pointer text-slate-505 hover:text-slate-800 hover:bg-slate-100/50 data-[state=active]:bg-white data-[state=active]:text-civic-primary data-[state=active]:shadow-3xs"
              >
                <Calendar size={16} />
                <span className="overflow-hidden transition-all duration-300 whitespace-nowrap max-w-0 opacity-0 group-data-[state=active]:max-w-[150px] group-data-[state=active]:opacity-100 group-data-[state=active]:ml-0.5">
                  Kelola Lingkungan
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB CONTENT: TRANSPARANSI */}
          <TabsContent value="transparansi" className="focus:outline-none">
            <TransparansiTab
              isAdmin={isAdmin}
              kasRT={kasRT}
              kasLedger={kasLedger}
              onAddTransaction={onAddTransaction}
              onEditTransaction={onEditTransaction}
              onDeleteTransaction={onDeleteTransaction}
            />
          </TabsContent>

          {/* TAB CONTENT: PERATURAN */}
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
                    <p className="text-xs text-slate-505 mt-1 font-bold leading-relaxed">Setiap tamu yang menginap lebih dari 1x24 jam wajib melaporkan diri kepada pengurus RT/RW melalui WhatsApp atau menu aduan dengan melampirkan identitas diri.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-civic-primary/10 text-civic-primary flex items-center justify-center font-black text-xs shrink-0 select-none mt-0.5">2</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Jam Tenang Lingkungan</h4>
                    <p className="text-xs text-slate-505 mt-1 font-bold leading-relaxed">Batas toleransi kebisingan atau kegiatan sosial kemasyarakatan yang menimbulkan keramaian maksimal pukul 22:00 WIB demi kenyamanan warga sekitar.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-civic-primary/10 text-civic-primary flex items-center justify-center font-black text-xs shrink-0 select-none mt-0.5">3</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Ketentuan Sampah Rumah Tangga</h4>
                    <p className="text-xs text-slate-505 mt-1 font-bold leading-relaxed">Sampah harus diletakkan di tempat pembuangan depan rumah dalam kondisi terbungkus rapi sebelum jam operasional truk pengangkut kebersihan kelurahan.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-civic-primary/10 text-civic-primary flex items-center justify-center font-black text-xs shrink-0 select-none mt-0.5">4</span>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Partisipasi Ronda & Keamanan</h4>
                    <p className="text-xs text-slate-555 mt-1 font-bold leading-relaxed">Warga pria dewasa wajib berpartisipasi menjaga keamanan lingkungan melalui piket ronda malam bergilir di Pos Kamling sesuai jadwal kelompok.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB CONTENT: KELOLA */}
          <TabsContent value="kelola" className="focus:outline-none">
            <KelolaRtTab
              isAdmin={isAdmin}
              jamSampah={jamSampah}
              jamOperasional={jamOperasional}
              onUpdateSchedules={onUpdateSchedules}
              emergencyContacts={emergencyContacts}
              onAddContact={onAddContact}
              onEditContact={onEditContact}
              onDeleteContact={onDeleteContact}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 5. DOKUMENTASI KEGIATAN WARGA */}
      <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 w-full space-y-4 overflow-hidden">
        {/* Header Seksi */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 select-none">
          <div className="flex items-center gap-2.5">
            <Calendar className="text-civic-primary shrink-0" size={20} />
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-800">Dokumentasi Kegiatan Warga</h3>
              <p className="text-xs text-slate-455 mt-0.5">Koleksi foto kerja bakti dan gotong royong warga bulan ini.</p>
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
            {/* Gradien Bayangan di Sisi Kiri & Kanan */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            {/* Jalur Animasi Gerak */}
            <div className="flex animate-marquee gap-4 transition-all duration-300">
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
    </div>
  );
};
