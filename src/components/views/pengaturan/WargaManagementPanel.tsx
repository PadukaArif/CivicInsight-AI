import React from 'react';
import { Award, Trash2 } from 'lucide-react';

interface WargaManagementPanelProps {
  approvedUsers: any[];
  onUpdateCitizenPoints?: (userId: string, points: number) => void;
  onDeleteCitizen?: (userId: string) => void;
}

export const WargaManagementPanel: React.FC<WargaManagementPanelProps> = ({
  approvedUsers = [],
  onUpdateCitizenPoints,
  onDeleteCitizen,
}) => {
  const [pointsInputs, setPointsInputs] = React.useState<Record<string, number>>({});

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 md:p-5 space-y-3.5 select-none">
      <h4 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2">
        <Award size={18} className="text-amber-700 shrink-0" />
        Daftar Akun Warga Terdaftar & Poin Partisipasi ({approvedUsers.length})
      </h4>
      <p className="text-xs text-amber-800 leading-normal font-medium">
        Kelola poin keaktifan warga yang telah disetujui. Admin dapat mengubah poin warga secara manual sebagai apresiasi partisipasi lingkungan.
      </p>
      
      {approvedUsers.length === 0 ? (
        <div className="text-center py-6 bg-white border border-dashed border-amber-250 rounded-xl text-slate-400 text-xs font-bold">
          Belum ada warga terdaftar.
        </div>
      ) : (
        <div className="space-y-3">
          {approvedUsers.map((user) => (
            <div key={user.id} className="bg-white border border-slate-205 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-3xs animate-fade-in">
              <div className="space-y-1 text-left">
                <p className="font-extrabold text-slate-805 text-sm">{user.nama}</p>
                <p className="text-slate-500 font-bold">Email: <span className="text-slate-700">{user.email}</span></p>
                <p className="text-slate-500 font-mono font-bold">NIK KTP: {user.nik}</p>
                <div className="flex items-center gap-1.5 mt-1 select-none">
                  <span className="bg-amber-100 text-amber-850 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Poin Saat Ini: {user.points ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    placeholder="Set Poin"
                    value={pointsInputs[user.id] !== undefined ? pointsInputs[user.id] : (user.points ?? 0)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setPointsInputs(prev => ({ ...prev, [user.id]: isNaN(val) ? 0 : val }));
                    }}
                    className="w-20 border border-slate-300 rounded-l-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-100"
                    autoComplete="off"
                  />
                  <button
                    onClick={() => {
                      const newPoints = pointsInputs[user.id] !== undefined ? pointsInputs[user.id] : (user.points ?? 0);
                      onUpdateCitizenPoints?.(user.id, newPoints);
                      alert(`Poin untuk ${user.nama} berhasil diperbarui menjadi ${newPoints} poin!`);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-r-lg cursor-pointer transition-colors shadow-3xs"
                  >
                    Simpan
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Apakah Anda yakin ingin menghapus warga ${user.nama} yang pindah rumah/RT? Seluruh data akun dan keluarga terkait akan dihapus.`)) {
                      onDeleteCitizen?.(user.id);
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-3xs flex items-center gap-1 shrink-0"
                >
                  <Trash2 size={12} />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
