import React from 'react';
import { Calendar, Plus, Edit, Trash2, Clock, UserCheck, PhoneCall } from 'lucide-react';

interface KelolaRtTabProps {
  isAdmin: boolean;
  jamSampah: string;
  jamOperasional: string;
  onUpdateSchedules: (jamSampah: string, jamOperasional: string) => void;
  emergencyContacts: Array<{ id: number; nama: string; nomor: string }>;
  onAddContact: (nama: string, nomor: string) => void;
  onEditContact: (id: number, nama: string, nomor: string) => void;
  onDeleteContact: (id: number) => void;
}

export const KelolaRtTab: React.FC<KelolaRtTabProps> = ({
  isAdmin,
  jamSampah,
  jamOperasional,
  onUpdateSchedules,
  emergencyContacts,
  onAddContact,
  onEditContact,
  onDeleteContact,
}) => {
  // State untuk edit jadwal (admin)
  const [isEditingSchedules, setIsEditingSchedules] = React.useState(false);
  const [inputSampah, setInputSampah] = React.useState(jamSampah);
  const [inputOperasional, setInputOperasional] = React.useState(jamOperasional);

  // State Emergency Contacts CRUD
  const [showAddContactForm, setShowAddContactForm] = React.useState(false);
  const [newContactNama, setNewContactNama] = React.useState('');
  const [newContactNomor, setNewContactNomor] = React.useState('');
  const [editingContact, setEditingContact] = React.useState<{ id: number; nama: string; nomor: string } | null>(null);
  const [editContactNama, setEditContactNama] = React.useState('');
  const [editContactNomor, setEditContactNomor] = React.useState('');

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

  return (
    <div className="space-y-6">
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
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider select-none">
              Ubah Parameter Operasional (Admin Only)
            </h4>
            
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
                className="bg-slate-200 text-slate-655 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-slate-300"
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

      {/* Pusat Kontak Darurat RT/RW */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-150 select-none">
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
                className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs"
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
              <div key={contact.id} className="p-3 bg-white border border-slate-200 hover:border-slate-350 rounded-xl flex items-center justify-between gap-2 transition-all hover:shadow-3xs">
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

      {/* Modal Edit Kontak Darurat */}
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
    </div>
  );
};
