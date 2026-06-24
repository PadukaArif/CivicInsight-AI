import React from 'react';
import { FamilyMember, Household } from '../../types';
import { User, LogIn, Check, MapPin, Phone, CreditCard } from 'lucide-react';

// Import subcomponents modular
import { FamilyMembersSection } from './pengaturan/FamilyMembersSection';
import { WargaManagementPanel } from './pengaturan/WargaManagementPanel';
import { RegistrationApprovalsPanel } from './pengaturan/RegistrationApprovalsPanel';
import { HouseholdCreationPanel } from './pengaturan/HouseholdCreationPanel';

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
  onLogout: () => void; // Callback keluar akun
  pendingRegistrations?: any[]; // Daftar pending user
  onApproveRegistration?: (id: string) => void; // Aksi approve
  onRejectRegistration?: (id: string) => void; // Aksi reject
  adminCredentials?: any; // Kredensial admin aktif
  onUpdateAdminCredentials?: (username: string, pass: string) => void; // Aksi update kredensial admin
  approvedUsers?: any[];
  onUpdateCitizenPoints?: (userId: string, points: number) => void;
  currentUser?: any;
  onDeleteCitizen?: (userId: string) => void;
  onAddHousehold?: (kepalaKeluarga: string, noKk: string, alamat: string, noHp: string) => void;
  onDeleteHousehold?: (id: number) => void;
  onResetAllData?: () => void;
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
  onLogout,
  pendingRegistrations = [],
  onApproveRegistration,
  onRejectRegistration,
  adminCredentials,
  onUpdateAdminCredentials,
  approvedUsers = [],
  onUpdateCitizenPoints,
  currentUser,
  onDeleteCitizen,
  onAddHousehold,
  onDeleteHousehold,
  onResetAllData,
}) => {
  // Simulasi profil mandiri Kepala Keluarga aktif yang login
  const citizenHousehold = React.useMemo(() => {
    if (currentUser && currentUser !== 'admin') {
      const match = households.find((h) => h.members.some((m) => m.nik === currentUser.nik));
      if (match) return match;
    }
    return households.find((h) => h.id === 1) || households[0];
  }, [households, currentUser]);

  // State profil Kepala Keluarga aktif
  const [profileName, setProfileName] = React.useState('Warga Teladan RT 04');
  const [profileAddress, setProfileAddress] = React.useState('Jl. Mawar Indah Gang 2 No. 12');
  const [profilePhone, setProfilePhone] = React.useState('0812-9988-7766');
  const [profileKk, setProfileKk] = React.useState('3273012903120004');
  const [profilePekerjaan, setProfilePekerjaan] = React.useState('Karyawan Swasta');

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* KOLOM KIRI & TENGAH (2 Kolom) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* ======================== WARGA VIEW: KELOLA PROFIL & KELUARGA ======================== */}
        {!isAdmin ? (
          <>
            {/* 1. Form Profil Warga */}
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
                    <label htmlFor="pname" className="block text-xs font-bold text-slate-505 mb-1">
                      Nama Lengkap Kepala Keluarga (Kunci/Hanya Baca):
                    </label>
                    <input
                      id="pname"
                      type="text"
                      disabled
                      value={profileName}
                      className="w-full border border-slate-200 bg-slate-100 text-slate-450 cursor-not-allowed rounded-xl px-3.5 py-2 text-sm focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label htmlFor="paddress" className="block text-xs font-bold text-slate-505 mb-1">
                      Alamat Rumah / No. Rumah (Kunci/Hanya Baca):
                    </label>
                    <div className="relative">
                      <input
                        id="paddress"
                        type="text"
                        disabled
                        value={profileAddress}
                        className="w-full border border-slate-200 bg-slate-100 text-slate-450 cursor-not-allowed rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none font-bold"
                      />
                      <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pphone" className="block text-xs font-bold text-slate-505 mb-1">
                      Nomor HP Warga (Kunci/Hanya Baca):
                    </label>
                    <div className="relative">
                      <input
                        id="pphone"
                        type="text"
                        disabled
                        value={profilePhone}
                        className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none font-bold"
                      />
                      <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pkk" className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Kartu Keluarga (KK):
                    </label>
                    <div className="relative font-bold">
                      <input
                        id="pkk"
                        type="text"
                        value={profileKk}
                        onChange={(e) => setProfileKk(e.target.value)}
                        className="w-full border border-slate-350 rounded-xl pl-10 pr-4 py-2 text-slate-855 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary"
                      />
                      <CreditCard size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ppekerjaan" className="block text-xs font-bold text-slate-505 mb-1">
                      Pekerjaan Kepala Keluarga (Kunci/Hanya Baca):
                    </label>
                    <input
                      id="ppekerjaan"
                      type="text"
                      disabled
                      value={profilePekerjaan}
                      className="w-full border border-slate-200 bg-slate-100 text-slate-455 cursor-not-allowed rounded-xl px-3.5 py-2 text-sm focus:outline-none font-bold"
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

            {/* 2. Daftar Anggota Keluarga (KK) */}
            <FamilyMembersSection
              household={citizenHousehold}
              isAdmin={isAdmin}
              onAddFamilyMember={onAddFamilyMember}
              onDeleteFamilyMember={onDeleteFamilyMember}
              onEditFamilyMember={onEditFamilyMember}
            />
          </>
        ) : (
          /* ======================== ADMIN VIEW: DATABASE KK WARGA ======================== */
          <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
            {/* Header Modul Database KK */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between select-none text-left">
              <div>
                <h3 className="text-lg font-black text-slate-800">Database Kartu Keluarga Lingkungan</h3>
                <p className="text-xs text-slate-450">Lihat, kelola, dan verifikasi struktur keluarga warga aktif.</p>
              </div>
              <span className="bg-blue-105 text-blue-800 border border-blue-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
                Sistem Terpusat
              </span>
            </div>

            {/* Panel Persetujuan Registrasi Warga Baru */}
            <RegistrationApprovalsPanel
              pendingRegistrations={pendingRegistrations}
              onApproveRegistration={onApproveRegistration}
              onRejectRegistration={onRejectRegistration}
            />

            {/* Panel Daftar Akun Warga Terdaftar & Poin Partisipasi */}
            <WargaManagementPanel
              approvedUsers={approvedUsers}
              onUpdateCitizenPoints={onUpdateCitizenPoints}
              onDeleteCitizen={onDeleteCitizen}
            />

            {/* Panel Tambah Kartu Keluarga (KK) Baru & database list */}
            <HouseholdCreationPanel
              households={households}
              onAddHousehold={onAddHousehold}
              onDeleteHousehold={onDeleteHousehold}
              onEditHouseholdKk={onEditHouseholdKk}
              onAddFamilyMember={onAddFamilyMember}
              onDeleteFamilyMember={onDeleteFamilyMember}
              onEditFamilyMember={onEditFamilyMember}
            />
          </div>
        )}

      </div>

      {/* KOLOM KANAN: LOGIN SIMULASI ADMIN & INFORMASI (1 Kolom) */}
      <div className="lg:col-span-1">
        <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20">
          
          {/* Header Status Akun */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 select-none">
            <LogIn className="text-civic-primary shrink-0" size={20} />
            <h3 className="text-sm font-bold text-slate-805 uppercase tracking-wider">Akses Portal Pengurus</h3>
          </div>

          {!isAdmin ? (
            /* STATUS MASUK WARGA */
            <div className="space-y-4 select-none">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Check size={20} />
                </div>
                <h4 className="font-extrabold text-teal-900 text-sm">Sesi Warga Aktif</h4>
                <p className="text-xs text-teal-800 mt-1 font-bold">Anda masuk ke akun portal warga.</p>
              </div>
              <p className="text-xs text-slate-500 leading-normal font-medium text-left">
                Gunakan tombol di bawah untuk keluar dari sistem dan kembali ke layar masuk utama.
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="w-full bg-slate-900 hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-xs"
              >
                Keluar dari Akun Warga
              </button>
            </div>
          ) : (
            /* PANEL ADMIN: UBHA KREDENSIAL & TOMBOL KELUAR */
            <div className="space-y-5 select-none animate-fade-in">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Check size={20} />
                </div>
                <h4 className="font-extrabold text-blue-900 text-sm font-bold">Status Pengurus Aktif</h4>
                <p className="text-xs text-blue-800 mt-1 font-bold">Sesi Administrator {activeRtRw} Aktif.</p>
              </div>

              {/* Form Ubah Kredensial Admin */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const userVal = (document.getElementById('new-admin-user') as HTMLInputElement)?.value;
                  const passVal = (document.getElementById('new-admin-pass') as HTMLInputElement)?.value;
                  if (userVal?.trim() && passVal?.trim()) {
                    onUpdateAdminCredentials?.(userVal.trim(), passVal.trim());
                    alert('Username & password pengurus berhasil diperbarui!');
                  }
                }}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-3xs text-left"
              >
                <span className="block font-bold text-slate-805 text-[11px] uppercase tracking-wider">Kredensial Pengurus</span>
                <div>
                  <label htmlFor="new-admin-user" className="block text-[10px] font-bold text-slate-500 mb-0.5">Username Baru:</label>
                  <input
                    id="new-admin-user"
                    type="text"
                    required
                    defaultValue={adminCredentials?.username || 'admin'}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-admin-pass" className="block text-[10px] font-bold text-slate-500 mb-0.5">Kata Sandi Baru:</label>
                  <input
                    id="new-admin-pass"
                    type="text"
                    required
                    defaultValue={adminCredentials?.password || '123'}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2 px-3 rounded-lg cursor-pointer transition-colors shadow-3xs"
                >
                  Simpan Kredensial Baru
                </button>
              </form>

              <button
                type="button"
                onClick={onLogout}
                className="w-full bg-slate-900 hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-xs"
              >
                Keluar Dari Sistem Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  const firstConfirm = confirm("Apakah Anda yakin ingin menghapus seluruh data portal? Tindakan ini tidak dapat dibatalkan!");
                  if (firstConfirm) {
                    const secondConfirm = confirm("PERINGATAN KEDUA: Seluruh akun warga terdaftar, keluarga, ledger transaksi, pengumuman, dan riwayat aduan akan dihapus permanen. Apakah Anda benar-benar yakin?");
                    if (secondConfirm) {
                      const verificationCode = prompt("Untuk memverifikasi tindakan ini, ketik kata kunci 'NETRALKAN' di bawah ini:");
                      if (verificationCode === "NETRALKAN") {
                        onResetAllData?.();
                      } else if (verificationCode !== null) {
                        alert("Kata kunci salah! Tindakan netralisasi dibatalkan.");
                      }
                    }
                  }
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-xs mt-2"
              >
                Netralisasikan Seluruh Data Portal
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
export default PengaturanView;
