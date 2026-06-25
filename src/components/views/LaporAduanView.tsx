import React from 'react';
import { Aduan } from '../../types';
import { Megaphone, MapPin, CheckCircle, Clock, AlertCircle, Send, Trash2, HelpCircle } from 'lucide-react';

/**
 * Interface props untuk LaporAduanView
 */
export interface LaporAduanViewProps {
  isAdmin: boolean; // Peran pengguna saat ini
  aduanList: Aduan[]; // Riwayat seluruh aduan warga
  onSubmitAduan: (kategori: string, lokasi: string, deskripsi: string) => void; // Aksi kirim aduan warga
  onUpdateAduanStatus: (id: number, status: 'Terkirim' | 'Diproses' | 'Selesai', response?: string) => void; // Aksi tindak lanjut admin
  onDeleteAduan: (id: number) => void; // Aksi hapus aduan oleh admin
}

export const LaporAduanView: React.FC<LaporAduanViewProps> = ({
  isAdmin,
  aduanList,
  onSubmitAduan,
  onUpdateAduanStatus,
  onDeleteAduan,
}) => {
  // State form warga
  const [kategori, setKategori] = React.useState('Kebersihan');
  const [lokasi, setLokasi] = React.useState('');
  const [deskripsi, setDeskripsi] = React.useState('');

  // State tab filter warga ("saya" vs "lingkungan")
  const [wargaActiveTab, setWargaActiveTab] = React.useState<'saya' | 'lingkungan'>('saya');

  // State filter status admin ("Semua", "Terkirim", "Diproses", "Selesai")
  const [adminActiveFilter, setAdminActiveFilter] = React.useState<'Semua' | 'Terkirim' | 'Diproses' | 'Selesai'>('Semua');

  // State menanggapi aduan (Admin)
  const [selectedAduanId, setSelectedAduanId] = React.useState<number | null>(null);
  const [tanggapanText, setTanggapanText] = React.useState('');
  const [statusSelect, setStatusSelect] = React.useState<'Terkirim' | 'Diproses' | 'Selesai'>('Diproses');

  // Urutkan aduan berdasarkan ID terbaru (simulasi kronologis)
  const sortedAduans = React.useMemo(() => {
    return [...aduanList].sort((a, b) => b.id - a.id);
  }, [aduanList]);

  // Statistik aduan untuk dasbor admin
  const stats = React.useMemo(() => {
    return {
      total: aduanList.length,
      terkirim: aduanList.filter((a) => a.status === 'Terkirim').length,
      diproses: aduanList.filter((a) => a.status === 'Diproses').length,
      selesai: aduanList.filter((a) => a.status === 'Selesai').length,
    };
  }, [aduanList]);

  // Filter aduan untuk tampilan admin
  const filteredAdminAduans = React.useMemo(() => {
    if (adminActiveFilter === 'Semua') return sortedAduans;
    return sortedAduans.filter((a) => a.status === adminActiveFilter);
  }, [sortedAduans, adminActiveFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokasi.trim() || !deskripsi.trim()) {
      alert('Harap isi kolom Lokasi dan Keterangan Masalah terlebih dahulu!');
      return;
    }
    onSubmitAduan(kategori, lokasi.trim(), deskripsi.trim());
    setLokasi('');
    setDeskripsi('');
    alert('Laporan aduan Anda berhasil terkirim. Pengurus RT akan meninjau dan memperbarui status laporan secara berkala.');
  };

  const handleOpenResponsePanel = (aduan: Aduan) => {
    setSelectedAduanId(aduan.id);
    setTanggapanText(aduan.tanggapanAdmin || '');
    setStatusSelect(aduan.status);
  };

  const handleSaveResponse = (id: number) => {
    onUpdateAduanStatus(id, statusSelect, tanggapanText.trim() || undefined);
    setSelectedAduanId(null);
    setTanggapanText('');
    alert('Tanggapan berhasil disimpan dan status laporan diperbarui!');
  };

  // Render badge status aduan
  const renderStatusBadge = (status: 'Terkirim' | 'Diproses' | 'Selesai') => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle size={12} />
            Selesai
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={12} />
            Diproses
          </span>
        );
      default: // Terkirim
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <AlertCircle size={12} />
            Terkirim
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ======================== VIEW WARGA ======================== */}
      {!isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Form Kirim Aduan (2 Kolom) */}
          <div className="lg:col-span-2 bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <Megaphone className="text-civic-primary shrink-0" size={20} />
              <h3 className="text-lg font-bold text-slate-800">Lapor Aduan & Kendala Warga</h3>
            </div>
            
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kategori-aduan" className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Laporan:
                  </label>
                  <select
                    id="kategori-aduan"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 bg-slate-100 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
                  >
                    <option value="Kebersihan">Kebersihan Lingkungan</option>
                    <option value="Infrastruktur">Jalan, Lampu, Saluran Air</option>
                    <option value="Keamanan">Ronda, Tindakan Mencurigakan</option>
                    <option value="Sosial">Kemasyarakatan, Hubungan Tetangga</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lokasi-aduan" className="block text-xs font-bold text-slate-700 mb-1">
                    Lokasi Kejadian / Objek Masalah:
                  </label>
                  <div className="relative">
                    <input
                      id="lokasi-aduan"
                      type="text"
                      required
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      placeholder="Contoh: Gang 3 depan rumah No. 12"
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-855 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                      autoComplete="off"
                    />
                    <MapPin size={16} className="absolute left-3.5 top-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="deskripsi-aduan" className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Detil Kendala:
                </label>
                <textarea
                  id="deskripsi-aduan"
                  rows={4}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tulis keterangan sedetail mungkin agar pengurus RT mudah mendata dan menindaklanjuti..."
                  className="w-full border border-slate-350 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-civic-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Send size={16} />
                Kirim Laporan ke Pengurus RT
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Daftar Riwayat Laporan */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filter Tab Warga */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex select-none">
              <button
                onClick={() => setWargaActiveTab('saya')}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  wargaActiveTab === 'saya'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Aduan Saya
              </button>
              <button
                onClick={() => setWargaActiveTab('lingkungan')}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  wargaActiveTab === 'lingkungan'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Aduan Wilayah RT
              </button>
            </div>

            {/* List Aduan Warga */}
            <div className="space-y-4">
              {sortedAduans.length === 0 ? (
                <div className="bg-civic-surface text-center py-8 rounded-2xl border border-dashed border-slate-200">
                  <HelpCircle className="mx-auto text-slate-300 mb-1" size={24} />
                  <p className="text-xs text-slate-500">Belum ada aduan terkirim.</p>
                </div>
              ) : (
                sortedAduans
                  .filter((a) => wargaActiveTab === 'lingkungan' || a.wargaNama === 'Warga Teladan RT 04')
                  .map((aduan) => (
                    <div
                      key={aduan.id}
                      className="bg-civic-surface rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                            {aduan.kategori}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{aduan.tanggal}</span>
                        </div>
                        
                        <p className="text-slate-800 font-bold text-sm leading-normal">{aduan.deskripsi}</p>
                        
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
                          <MapPin size={12} className="shrink-0 text-slate-400" />
                          {aduan.lokasi}
                        </p>
                      </div>

                      {/* Status & Tanggapan Admin */}
                      <div className="pt-2.5 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Laporan</span>
                          {renderStatusBadge(aduan.status)}
                        </div>

                        {aduan.tanggapanAdmin && (
                          <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-3">
                            <span className="block text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-0.5">Tanggapan Pengurus RT:</span>
                            <p className="text-xs text-teal-950 leading-relaxed italic">"{aduan.tanggapanAdmin}"</p>
                            {aduan.tanggalTanggapan && (
                              <span className="block text-[9px] text-teal-600/80 mt-1 text-right font-medium">Direspons pada {aduan.tanggalTanggapan}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      ) : (
        /* ======================== VIEW ADMIN (KELOLA) ======================== */
        <div className="space-y-6">
          
          {/* Dashboard Ringkasan Statistik Aduan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-civic-surface p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-black text-slate-800">{stats.total}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masuk</span>
            </div>
            <div className="bg-civic-surface p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-black text-blue-750">{stats.terkirim}</span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Terkirim</span>
            </div>
            <div className="bg-civic-surface p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-black text-amber-700">{stats.diproses}</span>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Diproses</span>
            </div>
            <div className="bg-civic-surface p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-black text-emerald-700">{stats.selesay || stats.selesai}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Selesai</span>
            </div>
          </div>

          {/* Filter Status Halaman Admin */}
          <div className="flex flex-wrap items-center gap-1.5 select-none bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-max">
            {(['Semua', 'Terkirim', 'Diproses', 'Selesai'] as const).map((filter) => {
              const isActive = adminActiveFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setAdminActiveFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Daftar Tiket Aduan Masuk */}
          <div className="space-y-4">
            {filteredAdminAduans.length === 0 ? (
              <div className="bg-civic-surface text-center py-10 rounded-2xl border border-dashed border-slate-200">
                <HelpCircle className="mx-auto text-slate-350 mb-2" size={32} />
                <p className="text-sm text-slate-500">Tidak menemukan aduan dengan filter ini.</p>
              </div>
            ) : (
              filteredAdminAduans.map((aduan) => {
                const isResponding = selectedAduanId === aduan.id;
                return (
                  <div
                    key={aduan.id}
                    className="bg-civic-surface rounded-2xl border border-slate-250 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {aduan.kategori}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Oleh: <span className="text-slate-700 font-bold">{aduan.wargaNama}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs text-slate-400 font-medium">{aduan.tanggal}</span>
                          <button
                            onClick={() => onDeleteAduan(aduan.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                            title="Hapus Tiket"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-800 font-bold text-sm leading-normal">{aduan.deskripsi}</p>
                      
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        Lokasi: {aduan.lokasi}
                      </p>
                    </div>

                    {/* Editor Tanggapan & Status (Admin) */}
                    {isResponding ? (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Ubah Status Laporan:
                            </label>
                            <select
                              value={statusSelect}
                              onChange={(e) => setStatusSelect(e.target.value as any)}
                              className="w-full border border-slate-300 rounded-xl p-2 bg-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
                            >
                              <option value="Terkirim">Terkirim (Belum Diproses)</option>
                              <option value="Diproses">Diproses (Tindak Lanjut)</option>
                              <option value="Selesai">Selesai (Tuntas)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tulis Tanggapan Resmi Pengurus RT:
                          </label>
                          <textarea
                            rows={3}
                            value={tanggapanText}
                            onChange={(e) => setTanggapanText(e.target.value)}
                            placeholder="Contoh: Kami sudah menghubungi seksi keamanan / dinas kebersihan untuk datang mengecek..."
                            className="w-full border border-slate-350 rounded-xl p-3 text-slate-855 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                            autoComplete="off"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveResponse(aduan.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                          >
                            Simpan Perubahan
                          </button>
                          <button
                            onClick={() => setSelectedAduanId(null)}
                            className="bg-slate-150 text-slate-650 hover:bg-slate-200 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Status Aktif:</span>
                          {renderStatusBadge(aduan.status)}
                        </div>

                        <button
                          onClick={() => handleOpenResponsePanel(aduan)}
                          className="bg-civic-primary hover:opacity-90 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                        >
                          Tindak Lanjuti
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
