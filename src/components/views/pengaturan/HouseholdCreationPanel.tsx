import React from 'react';
import { Plus, Search, Users, CreditCard, MapPin, ChevronUp, ChevronDown, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { FamilyMember, Household } from '../../../types';

interface HouseholdCreationPanelProps {
  households: Household[];
  onAddHousehold?: (kepalaKeluarga: string, noKk: string, alamat: string, noHp: string) => void;
  onDeleteHousehold?: (id: number) => void;
  onEditHouseholdKk: (householdId: number, noKk: string) => void;
  onAddFamilyMember: (member: Omit<FamilyMember, 'id'>, householdId: number) => void;
  onDeleteFamilyMember: (id: number) => void;
  onEditFamilyMember: (householdId: number, memberId: number, statusKawin: FamilyMember['statusKawin'], pendidikan: FamilyMember['pendidikan']) => void;
}

export const HouseholdCreationPanel: React.FC<HouseholdCreationPanelProps> = ({
  households,
  onAddHousehold,
  onDeleteHousehold,
  onEditHouseholdKk,
  onAddFamilyMember,
  onDeleteFamilyMember,
  onEditFamilyMember,
}) => {
  // State Admin: Pencarian & Ekspansi detail keluarga warga
  const [adminSearch, setAdminSearch] = React.useState('');
  const [expandedHouseholdId, setExpandedHouseholdId] = React.useState<number | null>(null);

  // State tambah anggota keluarga baru untuk Admin
  const [adminAddMemberHouseholdId, setAdminAddMemberHouseholdId] = React.useState<number | null>(null);

  // State Edit Anggota Keluarga Modal
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<FamilyMember | null>(null);
  const [editingHouseholdId, setEditingHouseholdId] = React.useState<number | null>(null);
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

  // Filter pencarian database untuk Admin
  const filteredHouseholds = React.useMemo(() => {
    if (!adminSearch.trim()) return households;
    const q = adminSearch.toLowerCase();
    
    return households.filter((h) => {
      if (h.kepalaKeluarga.toLowerCase().includes(q)) return true;
      if (h.noKk.includes(q)) return true;
      return h.members.some((m) => m.nama.toLowerCase().includes(q));
    });
  }, [households, adminSearch]);

  return (
    <div className="space-y-6">
      {/* Panel Tambah Kartu Keluarga (KK) Baru */}
      <div className="bg-slate-50 border border-slate-205 rounded-2xl p-4 md:p-5 space-y-3.5 select-none">
        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Plus size={18} className="text-civic-primary shrink-0" />
          Tambah Kartu Keluarga (KK) Baru
        </h4>
        <p className="text-xs text-slate-505 leading-normal font-medium">
          Admin dapat mendaftarkan Kartu Keluarga (KK) baru secara manual ke dalam database RT/RW.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const kepala = (form.elements.namedItem('kk-kepala') as HTMLInputElement).value;
            const kkNo = (form.elements.namedItem('kk-no') as HTMLInputElement).value;
            const alamat = (form.elements.namedItem('kk-alamat') as HTMLInputElement).value;
            const hp = (form.elements.namedItem('kk-hp') as HTMLInputElement).value;

            if (!kepala.trim() || !kkNo.trim() || !alamat.trim() || !hp.trim()) {
              alert('Harap lengkapi seluruh kolom formulir KK baru!');
              return;
            }

            onAddHousehold?.(kepala.trim(), kkNo.trim(), alamat.trim(), hp.trim());
            form.reset();
            alert('Kartu Keluarga (KK) baru berhasil didaftarkan ke sistem!');
          }}
          autoComplete="off"
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div>
            <input
              name="kk-kepala"
              type="text"
              placeholder="Nama Lengkap Kepala Keluarga"
              required
              className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-primary"
              autoComplete="off"
            />
          </div>
          <div>
            <input
              name="kk-no"
              type="text"
              placeholder="Nomor KK (16 Digit)"
              required
              className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-primary"
              autoComplete="off"
            />
          </div>
          <div>
            <input
              name="kk-alamat"
              type="text"
              placeholder="Alamat Lengkap / No. Rumah"
              required
              className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-primary"
              autoComplete="off"
            />
          </div>
          <div>
            <input
              name="kk-hp"
              type="text"
              placeholder="Nomor HP Aktif"
              required
              className="w-full border border-slate-300 bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-primary"
              autoComplete="off"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-civic-primary hover:bg-teal-850 text-white text-[10px] font-bold py-2 px-3 rounded-lg cursor-pointer transition-colors shadow-3xs"
            >
              Daftarkan KK Baru
            </button>
          </div>
        </form>
      </div>

      {/* Kolom Pencarian KK */}
      <div>
        <label htmlFor="admin-search" className="block text-xs font-bold text-slate-750 mb-1.5 select-none text-left">
          Cari Kepala Keluarga / Anggota Keluarga Terdaftar:
        </label>
        <div className="relative font-bold text-left">
          <input
            id="admin-search"
            type="text"
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            placeholder="Ketik nama warga, nama anak, istri, atau nomor KK untuk memfilter..."
            className="w-full border border-slate-300 bg-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
            autoComplete="off"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
      </div>

      {/* List Hasil Pencarian Kartu Keluarga Warga */}
      <div className="space-y-4">
        {filteredHouseholds.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-dashed rounded-2xl text-slate-450 text-sm select-none">
            <Users className="mx-auto text-slate-300 mb-2" size={32} />
            <span>Tidak menemukan profil keluarga warga dengan filter kata kunci "{adminSearch}".</span>
          </div>
        ) : (
          filteredHouseholds.map((house) => {
            const isExpanded = expandedHouseholdId === house.id;
            return (
              <div 
                key={house.id}
                className={`bg-white border rounded-2xl transition-all ${
                  isExpanded ? 'border-civic-primary shadow-xs' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Baris Informasi Utama Keluarga */}
                <div 
                  onClick={() => setExpandedHouseholdId(isExpanded ? null : house.id)}
                  className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-105 text-blue-800 flex items-center justify-center font-bold text-base shrink-0">
                      {house.kepalaKeluarga.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-850 text-sm">{house.kepalaKeluarga}</h4>
                      <p className="text-xs text-slate-555 font-mono flex items-center gap-1 mt-0.5 font-bold">
                        <CreditCard size={11} /> KK: {house.noKk}
                      </p>
                    </div>
                  </div>

                  {/* Rincian Alamat & Jumlah Anggota */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right hidden sm:block">
                      <p className="text-slate-700 font-medium flex items-center justify-end gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" /> {house.alamat}
                      </p>
                      <p className="text-slate-450 mt-0.5 font-medium">{house.noHp}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 font-extrabold px-2.5 py-1 rounded-lg text-[10px] uppercase">
                        {house.members.length} Anggota
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* AREA EKSPANSI: Daftar Anggota Keluarga Lengkap */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3 bg-slate-50/50 rounded-b-2xl space-y-3">
                    {/* Edit Nomor KK */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 select-none text-left">
                      <div>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Nomor Kartu Keluarga (KK):
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">{house.noKk}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={house.noKk}
                          id={`edit-kk-input-${house.id}`}
                          className="border border-slate-350 bg-white rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const inputVal = (document.getElementById(`edit-kk-input-${house.id}`) as HTMLInputElement)?.value;
                            if (inputVal && inputVal.trim()) {
                              onEditHouseholdKk(house.id, inputVal.trim());
                              alert('Nomor KK berhasil diperbarui!');
                            }
                          }}
                          className="bg-blue-605 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg cursor-pointer transition-colors"
                        >
                          Simpan KK
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus seluruh data Kartu Keluarga (KK) dari ${house.kepalaKeluarga}?`)) {
                              onDeleteHousehold?.(house.id);
                              alert('Kartu Keluarga (KK) berhasil dihapus!');
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg cursor-pointer transition-colors"
                        >
                          Hapus KK
                        </button>
                      </div>
                    </div>

                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none text-left">
                      Rincian Anggota Keluarga Terdaftar:
                    </span>
                    
                    <div className="space-y-2 text-left">
                      {house.members.map((member) => (
                        <div 
                          key={member.id}
                          className="bg-white p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm">{member.nama}</p>
                              <span className="text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.2 rounded mt-1 inline-block uppercase">
                                {member.hubungan}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">NIK KTP</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-705 font-mono">
                                  {maskNik(member.nik, !!showNikMap[`admin-${member.id}`])}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleNik(`admin-${member.id}`)}
                                  className="text-slate-400 hover:text-slate-650 p-0.5"
                                  title={showNikMap[`admin-${member.id}`] ? "Sembunyikan NIK" : "Tampilkan NIK"}
                                >
                                  {showNikMap[`admin-${member.id}`] ? <EyeOff size={11} /> : <Eye size={11} />}
                                </button>
                              </div>
                              <span className="block text-slate-500 text-[10px] mt-0.5">{member.tglLahir}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">Keterangan</span>
                              <p className="text-slate-805 font-bold">Pekerjaan: <span className="text-blue-805 bg-blue-50 px-1 py-0.2 rounded font-extrabold">{member.pekerjaan || 'Tidak Bekerja'}</span></p>
                              <p className="text-slate-805 font-bold">Pendidikan: {member.pendidikan}</p>
                              <p className="text-slate-700 font-bold">Status: {member.statusKawin}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-1 shrink-0 select-none">
                            <button
                              onClick={() => {
                                setEditingHouseholdId(house.id);
                                setEditingMember(member);
                                setEditStatusKawin(member.statusKawin);
                                setEditPendidikan(member.pendidikan);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Edit Anggota"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus ${member.nama} dari keluarga ini?`)) {
                                  onDeleteFamilyMember(member.id);
                                }
                              }}
                              className="p-1.5 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Anggota"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tambah Anggota Keluarga Baru */}
                    <div className="pt-1.5 select-none">
                      {adminAddMemberHouseholdId === house.id ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const nameVal = (document.getElementById(`admin-add-nama-${house.id}`) as HTMLInputElement)?.value;
                            const nikVal = (document.getElementById(`admin-add-nik-${house.id}`) as HTMLInputElement)?.value;
                            const tglVal = (document.getElementById(`admin-add-tgl-${house.id}`) as HTMLInputElement)?.value;
                            const jobVal = (document.getElementById(`admin-add-job-${house.id}`) as HTMLInputElement)?.value;
                            const hubVal = (document.getElementById(`admin-add-hub-${house.id}`) as HTMLSelectElement)?.value as any;
                            const statusVal = (document.getElementById(`admin-add-status-${house.id}`) as HTMLSelectElement)?.value as any;
                            const pendVal = (document.getElementById(`admin-add-pend-${house.id}`) as HTMLSelectElement)?.value as any;
                            
                            if (!nameVal || !nikVal || !tglVal) {
                              alert('Harap lengkapi formulir!');
                              return;
                            }
                            
                            onAddFamilyMember({
                              nama: nameVal.trim(),
                              nik: nikVal.trim(),
                              tglLahir: tglVal,
                              pekerjaan: jobVal.trim() || 'Tidak Bekerja',
                              hubungan: hubVal,
                              statusKawin: statusVal,
                              pendidikan: pendVal,
                            }, house.id);
                            
                            setAdminAddMemberHouseholdId(null);
                            alert('Anggota keluarga baru berhasil ditambahkan!');
                          }}
                          autoComplete="off"
                          className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-3xs text-left"
                        >
                          <span className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">Tambah Anggota Baru</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Nama Lengkap:</label>
                              <input id={`admin-add-nama-${house.id}`} required type="text" autoComplete="off" className="w-full border border-slate-300 bg-slate-100 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">NIK KTP:</label>
                              <input id={`admin-add-nik-${house.id}`} required type="text" autoComplete="off" className="w-full border border-slate-300 bg-slate-100 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Pekerjaan:</label>
                              <input id={`admin-add-job-${house.id}`} type="text" autoComplete="off" className="w-full border border-slate-300 bg-slate-100 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Tgl Lahir:</label>
                              <input id={`admin-add-tgl-${house.id}`} required type="date" autoComplete="off" className="w-full border border-slate-300 bg-slate-100 rounded-md px-1.5 py-0.5 text-xs text-slate-800 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Hubungan:</label>
                              <select id={`admin-add-hub-${house.id}`} className="w-full border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-800 bg-slate-100 focus:outline-none">
                                <option value="Suami">Suami</option>
                                <option value="Istri">Istri</option>
                                <option value="Anak">Anak</option>
                                <option value="Orang Tua">Orang Tua</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Status:</label>
                              <select id={`admin-add-status-${house.id}`} className="w-full border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-800 bg-slate-100 focus:outline-none">
                                <option value="Belum Kawin">Belum Kawin</option>
                                <option value="Kawin">Kawin</option>
                                <option value="Cerai Hidup">Cerai Hidup</option>
                                <option value="Cerai Mati">Cerai Mati</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Pendidikan:</label>
                              <select id={`admin-add-pend-${house.id}`} className="w-full border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-800 bg-slate-100 focus:outline-none">
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

                          <div className="flex gap-2 justify-end pt-1">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-755 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg cursor-pointer">Simpan</button>
                            <button type="button" onClick={() => setAdminAddMemberHouseholdId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-655 text-[10px] font-bold py-1.5 px-3.5 rounded-lg cursor-pointer">Batal</button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setAdminAddMemberHouseholdId(house.id)}
                          className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-dashed border-blue-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus size={14} />
                          Tambah Anggota Keluarga Baru
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Edit Status & Pendidikan */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-805">Edit Anggota Keluarga</h3>
              <button 
                onClick={() => { setShowEditModal(false); setEditingMember(null); }}
                className="text-slate-400 hover:text-slate-650 font-bold text-lg cursor-pointer"
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
                  if (editingHouseholdId !== null && editingMember !== null) {
                    onEditFamilyMember(editingHouseholdId, editingMember.id, editStatusKawin, editPendidikan);
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
