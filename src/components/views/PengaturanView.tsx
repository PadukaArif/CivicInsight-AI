import React from 'react';
import { FamilyMember, Household } from '../../types';
import { User, LogIn, Lock, Check, MapPin, Phone, CreditCard, Shield, Plus, Trash2, Calendar, BookOpen, Heart, Users, Search, ChevronDown, ChevronUp, Eye, EyeOff, Edit } from 'lucide-react';

/**
 * Interface props untuk PengaturanView
 */
export interface PengaturanViewProps {
  isAdmin: boolean; // Peran aktif
  onToggleRole: (value: boolean) => void; // Fungsi toggle login role (Warga vs Admin)
  activeRtRw: string; // RT/RW terpilih
  onRtRwChange: (value: string) => void; // Callback ketika RT/RW berubah
  households: Household[]; // Database seluruh keluarga terdaftar di RT/RW
  onAddFamilyMember: (member: Omit<FamilyMember, 'id'>, householdId?: number) => void; // Aksi tambah anggota keluarga (Warga & Admin)
  onDeleteFamilyMember: (id: number) => void; // Aksi hapus anggota keluarga (Warga & Admin)
  onEditFamilyMember: (householdId: number, memberId: number, statusKawin: FamilyMember['statusKawin'], pendidikan: FamilyMember['pendidikan']) => void; // Aksi edit anggota keluarga
  onEditHouseholdKk: (householdId: number, noKk: string) => void; // Aksi edit no KK
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  isAdmin,
  onToggleRole,
  activeRtRw,
  onRtRwChange,
  households,
  onAddFamilyMember,
  onDeleteFamilyMember,
  onEditFamilyMember,
  onEditHouseholdKk,
}) => {
  // Simulasi profil mandiri Kepala Keluarga aktif (selalu ID: 1 dalam demo)
  const citizenHousehold = React.useMemo(() => {
    return households.find((h) => h.id === 1) || households[0];
  }, [households]);

  const familyMembers = citizenHousehold ? citizenHousehold.members : [];

  // State profil Kepala Keluarga aktif
  const [profileName, setProfileName] = React.useState('Warga Teladan RT 04');
  const [profileAddress, setProfileAddress] = React.useState('Jl. Mawar Indah Gang 2 No. 12');
  const [profilePhone, setProfilePhone] = React.useState('0812-9988-7766');
  const [profileKk, setProfileKk] = React.useState('3273012903120004');
  const [profilePekerjaan, setProfilePekerjaan] = React.useState('Karyawan Swasta');
  
  // State form login pengurus (simulasi keamanan)
  const [loginPassword, setLoginPassword] = React.useState('');
  const [isLoginError, setIsLoginError] = React.useState(false);

  // State Edit Anggota Keluarga Modal
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<FamilyMember | null>(null);
  const [editingHouseholdId, setEditingHouseholdId] = React.useState<number | null>(null);
  const [editStatusKawin, setEditStatusKawin] = React.useState<FamilyMember['statusKawin']>('Belum Kawin');
  const [editPendidikan, setEditPendidikan] = React.useState<FamilyMember['pendidikan']>('SMA/SMK');

  // State tambah anggota keluarga baru untuk Admin
  const [adminAddMemberHouseholdId, setAdminAddMemberHouseholdId] = React.useState<number | null>(null);

  // State tambah anggota keluarga baru
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [memberNama, setMemberNama] = React.useState('');
  const [memberNik, setMemberNik] = React.useState('');
  const [memberTglLahir, setMemberTglLahir] = React.useState('');
  const [memberPekerjaan, setMemberPekerjaan] = React.useState('');
  const [memberHubungan, setMemberHubungan] = React.useState<FamilyMember['hubungan']>('Anak');
  const [memberStatusKawin, setMemberStatusKawin] = React.useState<FamilyMember['statusKawin']>('Belum Kawin');
  const [memberPendidikan, setMemberPendidikan] = React.useState<FamilyMember['pendidikan']>('SMA/SMK');

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

  // State Admin: Pencarian & Ekspansi detail keluarga warga
  const [adminSearch, setAdminSearch] = React.useState('');
  const [expandedHouseholdId, setExpandedHouseholdId] = React.useState<number | null>(null);

  // Sync profil warga ketika data KK Warga terpilih termuat
  React.useEffect(() => {
    if (citizenHousehold) {
      setProfileName(citizenHousehold.kepalaKeluarga);
      setProfileAddress(citizenHousehold.alamat);
      setProfilePhone(citizenHousehold.noHp);
      setProfileKk(citizenHousehold.noKk);
      const head = citizenHousehold.members.find((m) => m.hubungan === 'Kepala Keluarga');
      if (head) {
        setProfilePekerjaan(head.pekerjaan || 'Karyawan Swasta');
      }
    }
  }, [citizenHousehold]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileKk.trim()) {
      alert('Harap isi nomor KK dengan benar!');
      return;
    }
    
    onEditHouseholdKk(citizenHousehold.id, profileKk.trim());
    alert('Nomor KK berhasil disimpan!');
  };

  // Handler Kirim Tambah Anggota Keluarga Baru
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNama.trim() || !memberNik.trim() || !memberTglLahir) {
      alert('Harap lengkapi formulir pendaftaran anggota keluarga!');
      return;
    }
    // Validasi NIK angka (dilonggarkan panjangnya agar mempermudah pengujian local)
    if (isNaN(Number(memberNik))) {
      alert('Nomor NIK harus berupa angka!');
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
    });

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

  // Filter pencarian database untuk Admin
  const filteredHouseholds = React.useMemo(() => {
    if (!adminSearch.trim()) return households;
    const q = adminSearch.toLowerCase();
    
    return households.filter((h) => {
      // 1. Cari berdasarkan Nama Kepala Keluarga
      if (h.kepalaKeluarga.toLowerCase().includes(q)) return true;
      // 2. Cari berdasarkan Nomor KK
      if (h.noKk.includes(q)) return true;
      // 3. Cari berdasarkan Nama Anggota Keluarga didalamnya
      return h.members.some((m) => m.nama.toLowerCase().includes(q));
    });
  }, [households, adminSearch]);

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === 'adminrt' || loginPassword === '12345') {
      onToggleRole(true);
      setLoginPassword('');
      setIsLoginError(false);
      alert('Login Pengurus RT Berhasil! Navigasi desktop sekarang disesuaikan ke Panel Kontrol Admin (Warna Biru).');
    } else {
      setIsLoginError(true);
    }
  };

  const handleLogout = () => {
    onToggleRole(false);
    alert('Keluar Berhasil! Anda kembali sebagai Warga Biasa (Warna Hijau).');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* KOLOM KIRI & TENGAH (2 Kolom) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* ======================== WARGA VIEW: KELOLA PROFIL & KELUARGA ======================== */}
        {!isAdmin ? (
          <>
            {/* 1. Form Profil Kepala Keluarga (Warga) */}
            <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2 select-none">
                <User className="text-civic-primary shrink-0" size={20} />
                Data Profil Kepala Keluarga
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-normal">
                Informasi di bawah ini digunakan untuk sinkronisasi data kependudukan RT secara otomatis.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pname" className="block text-xs font-bold text-slate-500 mb-1">
                      Nama Lengkap Kepala Keluarga (Kunci/Hanya Baca):
                    </label>
                    <input
                      id="pname"
                      type="text"
                      disabled
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-100 text-slate-450 cursor-not-allowed rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="paddress" className="block text-xs font-bold text-slate-500 mb-1">
                      Alamat Rumah / No. Rumah (Kunci/Hanya Baca):
                    </label>
                    <div className="relative">
                      <input
                        id="paddress"
                        type="text"
                        disabled
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-100 text-slate-450 cursor-not-allowed rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
                      />
                      <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pphone" className="block text-xs font-bold text-slate-500 mb-1">
                      Nomor HP Warga (Kunci/Hanya Baca):
                    </label>
                    <div className="relative">
                      <input
                        id="pphone"
                        type="text"
                        disabled
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
                      />
                      <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pkk" className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Kartu Keluarga (KK):
                    </label>
                    <div className="relative">
                      <input
                        id="pkk"
                        type="text"
                        value={profileKk}
                        onChange={(e) => setProfileKk(e.target.value)}
                        className="w-full border border-slate-350 rounded-xl pl-10 pr-4 py-2 text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
                      />
                      <CreditCard size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ppekerjaan" className="block text-xs font-bold text-slate-500 mb-1">
                      Pekerjaan Kepala Keluarga (Kunci/Hanya Baca):
                    </label>
                    <input
                      id="ppekerjaan"
                      type="text"
                      disabled
                      value={profilePekerjaan}
                      onChange={(e) => setProfilePekerjaan(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-civic-primary hover:bg-teal-850 text-white font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer text-xs shadow-3xs"
                >
                  Simpan Profil Warga
                </button>
              </form>
            </div>

            {/* 2. Daftar Anggota Keluarga (KK) - Warga View */}
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
                <form onSubmit={handleAddMemberSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 space-y-3.5">
                  <span className="block font-bold text-slate-800 text-xs">Pendaftaran Anggota KK Baru</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="mname" className="block text-[10px] font-bold text-slate-650 mb-0.5">Nama Lengkap Anggota:</label>
                      <input
                        id="mname"
                        type="text"
                        required
                        value={memberNama}
                        onChange={(e) => setMemberNama(e.target.value)}
                        placeholder="Contoh: Siti Aisyah"
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-855 focus:outline-none"
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
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-855 focus:outline-none"
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
                        className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-855 focus:outline-none"
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
                        className="w-full border border-slate-300 bg-white rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="mhub" className="block text-[10px] font-bold text-slate-655 mb-0.5">Hubungan KK:</label>
                      <select
                        id="mhub"
                        value={memberHubungan}
                        onChange={(e) => setMemberHubungan(e.target.value as any)}
                        className="w-full border border-slate-300 bg-white rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
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
                        className="w-full border border-slate-300 bg-white rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
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
                        className="w-full border border-slate-300 bg-white rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
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

              {/* Daftar Anggota KK (Dinamis & Bebas Batasan Jumlah) */}
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
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
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
                          <p className="text-slate-700 font-bold flex items-center gap-1.5 mt-0.5">
                            <BookOpen size={12} className="text-slate-400 shrink-0" /> {member.pendidikan}
                          </p>
                          <p className="text-slate-705 font-bold flex items-center gap-1.5 mt-1">
                            <Heart size={12} className="text-slate-400 shrink-0" /> {member.statusKawin}
                          </p>
                        </div>
                      </div>

                      {/* Aksi Anggota KK */}
                      <div className="flex gap-1 shrink-0 select-none">
                        <button
                          onClick={() => {
                            setEditingHouseholdId(citizenHousehold.id);
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
            </div>
          </>
        ) : (
          /* ======================== ADMIN VIEW: DATABASE KK WARGA (SEARCH & VIEW) ======================== */
          <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
            
            {/* Header Modul Database KK */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Users className="text-civic-primary shrink-0" size={22} />
                <div>
                  <h3 className="text-lg font-black text-slate-805">Database Kartu Keluarga Lingkungan</h3>
                  <p className="text-xs text-slate-450">Lihat, kelola, dan verifikasi struktur keluarga warga aktif.</p>
                </div>
              </div>
              
              <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Sistem Terpusat
              </span>
            </div>

            {/* Kolom Pencarian KK (Nama Kepala Keluarga, No KK, atau Nama Anggota Keluarga) */}
            <div>
              <label htmlFor="admin-search" className="block text-xs font-bold text-slate-750 mb-1.5 select-none">
                Cari Kepala Keluarga / Anggota Keluarga Terdaftar:
              </label>
              <div className="relative">
                <input
                  id="admin-search"
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Ketik nama warga, nama anak, istri, atau nomor KK untuk memfilter..."
                  className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
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
                      {/* Baris Informasi Utama Keluarga (Dapat Diklik untuk Membuka Anggota) */}
                      <div 
                        onClick={() => setExpandedHouseholdId(isExpanded ? null : house.id)}
                        className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-base shrink-0">
                            {house.kepalaKeluarga.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-850 text-sm">{house.kepalaKeluarga}</h4>
                            <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
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

                      {/* AREA EKSPANSI: Daftar Anggota Keluarga Lengkap (Dapat di-CRUD oleh Admin) */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-100 pt-3 bg-slate-50/50 rounded-b-2xl space-y-3">
                          {/* 1. Edit Nomor KK */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 select-none">
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
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg cursor-pointer transition-colors"
                              >
                                Simpan KK
                              </button>
                            </div>
                          </div>

                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
                            Rincian Anggota Keluarga Terdaftar:
                          </span>
                          
                          <div className="space-y-2">
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
                                      <span className="font-bold text-slate-700 font-mono">
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
                                    <span className="block text-slate-505 text-[10px] mt-0.5">{member.tglLahir}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 block font-bold">Keterangan</span>
                                    <p className="text-slate-800 font-bold">Pekerjaan: <span className="text-blue-800 bg-blue-50 px-1 py-0.2 rounded font-extrabold">{member.pekerjaan || 'Tidak Bekerja'}</span></p>
                                    <p className="text-slate-800 font-bold">Pendidikan: {member.pendidikan}</p>
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

                          {/* 2. Tambah Anggota Keluarga Baru */}
                          <div className="pt-1.5">
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
                                className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-3xs"
                              >
                                <span className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider select-none">Tambah Anggota Baru</span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Nama Lengkap:</label>
                                    <input id={`admin-add-nama-${house.id}`} required type="text" className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">NIK KTP:</label>
                                    <input id={`admin-add-nik-${house.id}`} required type="text" className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Pekerjaan:</label>
                                    <input id={`admin-add-job-${house.id}`} type="text" className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Tgl Lahir:</label>
                                    <input id={`admin-add-tgl-${house.id}`} required type="date" className="w-full border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-800 focus:outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Hubungan:</label>
                                    <select id={`admin-add-hub-${house.id}`} className="w-full border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-800 bg-white focus:outline-none">
                                      <option value="Suami">Suami</option>
                                      <option value="Istri">Istri</option>
                                      <option value="Anak">Anak</option>
                                      <option value="Orang Tua">Orang Tua</option>
                                      <option value="Lainnya">Lainnya</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Status:</label>
                                    <select id={`admin-add-status-${house.id}`} className="w-full border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-800 bg-white focus:outline-none">
                                      <option value="Belum Kawin">Belum Kawin</option>
                                      <option value="Kawin">Kawin</option>
                                      <option value="Cerai Hidup">Cerai Hidup</option>
                                      <option value="Cerai Mati">Cerai Mati</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Pendidikan:</label>
                                    <select id={`admin-add-pend-${house.id}`} className="w-full border border-slate-300 rounded-md px-1.5 py-0.5 text-xs text-slate-800 bg-white focus:outline-none">
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
                                  <button type="submit" className="bg-blue-600 hover:bg-blue-755 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg cursor-pointer">Simpan</button>
                                  <button type="button" onClick={() => setAdminAddMemberHouseholdId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-650 text-[10px] font-bold py-1.5 px-3.5 rounded-lg cursor-pointer">Batal</button>
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

          </div>
        )}

      </div>

      {/* KOLOM KANAN: LOGIN SIMULASI ADMIN & INFORMASI (1 Kolom) */}
      <div className="lg:col-span-1">
        <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20">
          
          {/* Header Status Akun */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 select-none">
            <LogIn className="text-civic-primary shrink-0" size={20} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Akses Portal Pengurus</h3>
          </div>

          {!isAdmin ? (
            /* FORM LOGIN SIMULASI ADMIN */
            <form onSubmit={handleSimulateLogin} className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal mb-1">
                Gunakan sandi di bawah untuk masuk ke panel administrasi RT/RW dan mengelola data warga.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-650 space-y-1 select-none">
                <span className="block font-bold text-slate-700">Petunjuk Masuk (Demo):</span>
                <p>Masukkan sandi: <code className="bg-slate-200 text-slate-900 px-1 py-0.5 rounded font-mono font-bold">adminrt</code> atau <code className="bg-slate-200 text-slate-900 px-1 py-0.5 rounded font-mono font-bold">12345</code></p>
              </div>

              <div>
                <label htmlFor="pass-login" className="block text-xs font-bold text-slate-700 mb-1">
                  Sandi Pengurus RT/RW:
                </label>
                <div className="relative">
                  <input
                    id="pass-login"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan sandi..."
                    className="w-full border border-slate-350 rounded-xl pl-10 pr-4 py-2.5 text-slate-855 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
                  />
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
                {isLoginError && (
                  <span className="block text-[10px] text-rose-605 font-bold mt-1.5">
                    Sandi salah! Gunakan sandi "adminrt" untuk masuk.
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-civic-primary text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-3xs"
              >
                Masuk Sebagai Pengurus RT
              </button>
            </form>
          ) : (
            /* STATUS MASUK ADMIN & TOMBOL KELUAR - Tombol Keluar dirubah dari bg-slate-850 ke bg-slate-900 */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Check size={20} />
                </div>
                <h4 className="font-extrabold text-blue-900 text-sm">Status Masuk Aktif</h4>
                <p className="text-xs text-blue-800 mt-1">Anda masuk sebagai Administrator {activeRtRw}.</p>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                Keluar untuk kembali ke mode Warga Biasa dan menonaktifkan panel edit data warga.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
              >
                Keluar Dari Sistem Admin
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Modal Edit Status & Pendidikan (Hanya Status & Pendidikan yang bisa diedit) */}
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
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
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
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
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
