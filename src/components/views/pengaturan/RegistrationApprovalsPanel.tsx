import React from 'react';
import { UserCheck } from 'lucide-react';

interface RegistrationApprovalsPanelProps {
  pendingRegistrations: any[];
  onApproveRegistration?: (id: string) => void;
  onRejectRegistration?: (id: string) => void;
}

export const RegistrationApprovalsPanel: React.FC<RegistrationApprovalsPanelProps> = ({
  pendingRegistrations = [],
  onApproveRegistration,
  onRejectRegistration,
}) => {
  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 md:p-5 space-y-3.5 select-none">
      <h4 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
        <UserCheck size={18} className="text-blue-700 shrink-0" />
        Persetujuan Registrasi Warga Baru ({pendingRegistrations.length})
      </h4>
      <p className="text-xs text-blue-805 leading-normal font-medium">
        Daftar akun warga baru yang mengajukan registrasi. Harap verifikasi dokumen NIK warga secara langsung sebelum menyetujui (approve) akun mereka.
      </p>
      
      {pendingRegistrations.length === 0 ? (
        <div className="text-center py-6 bg-white border border-dashed border-blue-250 rounded-xl text-slate-400 text-xs font-bold">
          Tidak ada pengajuan registrasi warga baru yang tertunda.
        </div>
      ) : (
        <div className="space-y-3 text-left">
          {pendingRegistrations.map((user) => (
            <div key={user.id} className="bg-white border border-slate-205 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-3xs animate-fade-in">
              <div className="space-y-1">
                <p className="font-extrabold text-slate-805 text-sm">{user.nama}</p>
                <p className="text-slate-500 font-bold">Email: <span className="text-slate-700">{user.email}</span></p>
                <p className="text-slate-505 font-mono font-bold">NIK KTP: {user.nik}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onApproveRegistration?.(user.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-3xs"
                >
                  Setujui
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menolak dan menghapus pengajuan registrasi dari ${user.nama}?`)) {
                      onRejectRegistration?.(user.id);
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-3xs"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
