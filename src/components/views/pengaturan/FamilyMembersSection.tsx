import React from 'react';
import { User, Plus, Users, CreditCard, Calendar, BookOpen, Heart, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { FamilyMember, Household } from '../../../types';

interface FamilyMembersSectionProps {
  household?: Household;
  isAdmin: boolean;
  onAddFamilyMember: (member: Omit<FamilyMember, 'id'>, householdId: number) => void;
  onDeleteFamilyMember: (id: number) => void;
  onEditFamilyMember: (householdId: number, memberId: number, statusKawin: FamilyMember['statusKawin'], pendidikan: FamilyMember['pendidikan']) => void;
}

export const FamilyMembersSection: React.FC<FamilyMembersSectionProps> = ({
  household,
  onAddFamilyMember,
  onDeleteFamilyMember,
  onEditFamilyMember,
}) => {
  const familyMembers = household ? household.members : [];

  // State tambah anggota keluarga baru
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [memberNama, setMemberNama] = React.useState('');
  const [memberNik, setMemberNik] = React.useState('');
  const [memberTglLahir, setMemberTglLahir] = React.useState('');
  const [memberPekerjaan, setMemberPekerjaan] = React.useState('');
  const [memberHubungan, setMemberHubungan] = React.useState<FamilyMember['hubungan']>('Anak');
  const [memberStatusKawin, setMemberStatusKawin] = React.useState<FamilyMember['statusKawin']>('Belum Kawin');
  const [memberPendidikan, setMemberPendidikan] = React.useState<FamilyMember['pendidikan']>('SMA/SMK');

  // State Edit Anggota Keluarga Modal
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<FamilyMember | null>(null);
  const [editStatusKawin, setEditStatusKawin] = React.useState<FamilyMember['statusKawin']>('Belum Kawin');
  const [editPendidikan, setEditPendidikan] = React.useState<FamilyMember['pendidikan']>('SMA/SMK');

  // State NIK Masking Toggle
  const [showNikMap, setShowNikMap] = React.useState<Record<string | number, boolean>>({});

  const toggleNik = (id: string | number) => {
    setShowNikMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const maskNik = (nik: string, show: boolean) => {
    if (show || !nik) return nik;
    if (nik.length <= 8) return '********';
    return nik.substring(0, 4) + '********' + nik.substring(nik.length - 4);
  };

  // Handler Kirim Tambah Anggota Keluarga Baru
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNama.trim() || !memberNik.trim() || !memberTglLahir) {
      alert('Harap lengkapi formulir pendaftaran anggota keluarga!');
      return;
    }
    if (isNaN(Number(memberNik))) {
      alert('Nomor NIK harus berupa angka!');
      return;
    }

    if (!household) {
      alert('Data kartu keluarga tidak ditemukan!');
      return;
    }

    onAddFamilyMember({
      nama: memberNama.trim(),
      nik: memberNik.trim(),
      tglLahir: memberTglLahir,
      pekerjaan: memberPekerjaan.trim() || 'Tidak Bekerja',
      hubungan: memberHubungan,
      statusKawin: memberStatusKawin,
      pendidikan: memberPendidikan,
    }, household.id);

    // Reset formulir input setelah berhasil
    setMemberNama('');
    setMemberNik('');
    setMemberTglLahir('');
    setMemberPekerjaan('');
    setMemberHubungan('Anak');
    setMemberStatusKawin('Belum Kawin');
    setMemberPendidikan('SMA/SMK');
    setShowAddForm(false);
  };

  return (
    <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 select-none">
        <div className="flex items-center gap-2">
          <Users className="text-civic-primary shrink-0" size={20} />
          <h3 className="text-lg font-bold text-slate-800">
            Daftar Anggota Keluarga (KK)
          </h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-civic-primary hover:bg-teal-850 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} />
          Tambah Anggota
        </button>
      </div>

      {/* Form Tambah Anggota Keluarga Baru */}
      {showAddForm && (
        <form onSubmit={handleAddMemberSubmit} autoComplete="off" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 space-y-3.5">
          <span className="block font-bold text-slate-800 text-xs">Pendaftaran Anggota KK Baru</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="mname" className="block text-[10px] font-bold text-slate-655 mb-0.5">Nama Lengkap Anggota:</label>
              <input
                id="mname"
                type="text"
                required
                value={memberNama}
                onChange={(e) => setMemberNama(e.target.value)}
                placeholder="Contoh: Siti Aisyah"
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-855 focus:outline-none"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="mnik" className="block text-[10px] font-bold text-slate-655 mb-0.5">NIK KTP (Anggota):</label>
              <input
                id="mnik"
                type="text"
                required
                value={memberNik}
                onChange={(e) => setMemberNik(e.target.value)}
                placeholder="Masukkan angka NIK..."
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-855 focus:outline-none"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="mpekerjaan" className="block text-[10px] font-bold text-slate-655 mb-0.5">Pekerjaan Anggota:</label>
              <input
                id="mpekerjaan"
                type="text"
                required
                value={memberPekerjaan}
                onChange={(e) => setMemberPekerjaan(e.target.value)}
                placeholder="Contoh: Wiraswasta, Pelajar..."
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-855 focus:outline-none"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="mbdate" className="block text-[10px] font-bold text-slate-655 mb-0.5">Tanggal Lahir:</label>
              <input
                id="mbdate"
                type="date"
                required
                value={memberTglLahir}
                onChange={(e) => setMemberTglLahir(e.target.value)}
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="mhub" className="block text-[10px] font-bold text-slate-655 mb-0.5">Hubungan KK:</label>
              <select
                id="mhub"
                value={memberHubungan}
                onChange={(e) => setMemberHubungan(e.target.value as any)}
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="Suami">Suami</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Orang Tua">Orang Tua</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label htmlFor="mstatus" className="block text-[10px] font-bold text-slate-655 mb-0.5">Status Kawin:</label>
              <select
                id="mstatus"
                value={memberStatusKawin}
                onChange={(e) => setMemberStatusKawin(e.target.value as any)}
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>
            <div>
              <label htmlFor="mpend" className="block text-[10px] font-bold text-slate-655 mb-0.5">Pendidikan:</label>
              <select
                id="mpend"
                value={memberPendidikan}
                onChange={(e) => setMemberPendidikan(e.target.value as any)}
                className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="Tidak Sekolah">Tidak Sekolah</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1 select-none">
            <button
              type="submit"
              className="bg-civic-primary hover:bg-teal-850 text-white text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer"
            >
              Simpan Anggota
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-200 hover:bg-slate-305 text-slate-650 text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Daftar Anggota KK */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {familyMembers.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 border border-dashed rounded-2xl text-slate-400 text-xs select-none flex flex-col items-center gap-1.5">
            <Users size={28} className="text-slate-300" />
            <span>Belum ada anggota keluarga terdaftar.</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-civic-primary hover:underline font-bold text-xs mt-1.5 cursor-pointer"
            >
              Klik untuk tambah anggota pertama
            </button>
          </div>
        ) : (
          familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-between gap-4 transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 text-xs">
                {/* Kolom 1: Nama & Hubungan */}
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1 select-none">
                    <User size={10} className="text-slate-450" /> Nama & Hubungan
                  </span>
                  <p className="font-extrabold text-slate-850 text-sm mt-0.5">{member.nama}</p>
                  <span className="text-[10px] text-teal-800 bg-teal-100/70 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1.5 inline-block">
                    {member.hubungan}
                  </span>
                </div>

                {/* Kolom 2: NIK & Pekerjaan */}
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1 select-none">
                    <CreditCard size={10} className="text-slate-455" /> NIK & Pekerjaan
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="font-bold text-slate-700 font-mono">
                      {maskNik(member.nik, !!showNikMap[member.id])}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleNik(member.id)}
                      className="text-slate-400 hover:text-slate-650 transition-colors p-1"
                      title={showNikMap[member.id] ? "Sembunyikan NIK" : "Tampilkan NIK"}
                    >
                      {showNikMap[member.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <p className="text-slate-805 font-bold mt-1">
                    Pekerjaan: <span className="text-teal-800 font-extrabold bg-teal-50 px-1.5 py-0.5 rounded">{member.pekerjaan || 'Tidak Bekerja'}</span>
                  </p>
                  <p className="text-slate-500 flex items-center gap-1 mt-1 font-medium">
                    <Calendar size={12} className="text-slate-400 shrink-0" /> {member.tglLahir}
                  </p>
                </div>

                {/* Kolom 3: Pendidikan & Pernikahan */}
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1 select-none">
                    <BookOpen size={10} className="text-slate-455" /> Pendidikan & Pernikahan
                  </span>
                  <p className="text-slate-705 font-bold flex items-center gap-1.5 mt-0.5">
                    <BookOpen size={12} className="text-slate-400 shrink-0" /> {member.pendidikan}
                  </p>
                  <p className="text-slate-755 font-bold flex items-center gap-1.5 mt-1">
                    <Heart size={12} className="text-slate-400 shrink-0" /> {member.statusKawin}
                  </p>
                </div>
              </div>

              {/* Aksi Anggota KK */}
              <div className="flex gap-1 shrink-0 select-none">
                <button
                  onClick={() => {
                    setEditingMember(member);
                    setEditStatusKawin(member.statusKawin);
                    setEditPendidikan(member.pendidikan);
                    setShowEditModal(true);
                  }}
                  className="text-slate-400 hover:text-civic-primary p-2.5 rounded-xl hover:bg-slate-200/50 cursor-pointer transition-colors"
                  title="Edit Anggota Keluarga"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Apakah Anda yakin ingin menghapus ${member.nama} dari keluarga ini?`)) {
                      onDeleteFamilyMember(member.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-2.5 rounded-xl hover:bg-slate-200/50 cursor-pointer transition-colors"
                  title="Hapus Anggota Keluarga"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Edit Status & Pendidikan */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-805">Edit Anggota Keluarga</h3>
              <button 
                onClick={() => { setShowEditModal(false); setEditingMember(null); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 select-none">Nama Lengkap (Kunci/Hanya Baca):</label>
                <input
                  type="text"
                  disabled
                  value={editingMember.nama}
                  className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 select-none">NIK (Kunci/Hanya Baca):</label>
                <input
                  type="text"
                  disabled
                  value={editingMember.nik}
                  className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 select-none">Hubungan (Kunci/Hanya Baca):</label>
                  <input
                    type="text"
                    disabled
                    value={editingMember.hubungan}
                    className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 select-none">Pekerjaan (Kunci/Hanya Baca):</label>
                  <input
                    type="text"
                    disabled
                    value={editingMember.pekerjaan || 'Tidak Bekerja'}
                    className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-status-kawin" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Status Pernikahan (Bisa Diubah):</label>
                <select
                  id="edit-status-kawin"
                  value={editStatusKawin}
                  onChange={(e) => setEditStatusKawin(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-pendidikan" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pendidikan Terakhir (Bisa Diubah):</label>
                <select
                  id="edit-pendidikan"
                  value={editPendidikan}
                  onChange={(e) => setEditPendidikan(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
                >
                  <option value="Tidak Sekolah">Tidak Sekolah</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (household && editingMember) {
                    onEditFamilyMember(household.id, editingMember.id, editStatusKawin, editPendidikan);
                    setShowEditModal(false);
                    setEditingMember(null);
                    alert('Status & pendidikan anggota keluarga berhasil diperbarui!');
                  }
                }}
                className="bg-civic-primary hover:bg-teal-850 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingMember(null); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-655 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
