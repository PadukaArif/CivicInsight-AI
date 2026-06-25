import React from 'react';
import { Megaphone, Trash2, Calendar, Edit, Plus } from 'lucide-react';
import { Announcement } from '../../../types';

interface AnnouncementsListProps {
  isAdmin: boolean;
  announcements: Announcement[];
  onDeleteAnnouncement: (id: number) => void;
  onEditAnnouncement: (id: number, title: string, content: string, category: 'Penting' | 'Umum' | 'Kegiatan', urgency: 'high' | 'normal') => void;
}

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  isAdmin,
  announcements,
  onDeleteAnnouncement,
  onEditAnnouncement,
}) => {
  // State Edit Pengumuman Modal
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
  const [editAnnJudul, setEditAnnJudul] = React.useState('');
  const [editAnnKonten, setEditAnnKonten] = React.useState('');
  const [editAnnKategori, setEditAnnKategori] = React.useState<'Penting' | 'Umum' | 'Kegiatan'>('Umum');
  const [editAnnUrgensi, setEditAnnUrgensi] = React.useState<'high' | 'normal'>('normal');

  return (
    <div className="lg:col-span-2 bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 select-none">
        <Megaphone className="text-civic-primary shrink-0" size={20} />
        <h3 className="text-lg font-bold text-slate-800">Pengumuman Warga Terbaru</h3>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Megaphone className="mx-auto text-slate-300 mb-2" size={32} />
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
                        ? 'bg-rose-105 text-rose-850' 
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

      {/* Modal Edit Pengumuman */}
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
              autoComplete="off"
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  required
                  value={editAnnJudul}
                  onChange={(e) => setEditAnnJudul(e.target.value)}
                  className="w-full border border-slate-350 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none bg-slate-100"
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori:</label>
                  <select
                    value={editAnnKategori}
                    onChange={(e) => setEditAnnKategori(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-slate-100 text-slate-800 focus:outline-none"
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
                    className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-slate-100 text-slate-800 focus:outline-none"
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
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none bg-slate-100"
                  autoComplete="off"
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
    </div>
  );
};

interface AddAnnouncementFormProps {
  onAddAnnouncement: (title: string, content: string, category: 'Penting' | 'Umum' | 'Kegiatan', urgency: 'high' | 'normal') => void;
}

export const AddAnnouncementForm: React.FC<AddAnnouncementFormProps> = ({
  onAddAnnouncement,
}) => {
  const [judul, setJudul] = React.useState('');
  const [konten, setKonten] = React.useState('');
  const [kategori, setKategori] = React.useState<'Penting' | 'Umum' | 'Kegiatan'>('Umum');
  const [urgensi, setUrgensi] = React.useState<'high' | 'normal'>('normal');

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

  return (
    <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Plus className="text-civic-primary" size={20} />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Terbitkan Pengumuman</h3>
      </div>

      <form onSubmit={handleSubmitAnnouncement} autoComplete="off" className="space-y-4">
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
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
            autoComplete="off"
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
              className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-slate-100 text-slate-855 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
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
              className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-slate-100 text-slate-855 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
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
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
            autoComplete="off"
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
  );
};
