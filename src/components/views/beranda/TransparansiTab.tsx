import React from 'react';
import { Wallet, Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { LedgerTransaction } from '../../../types';

interface TransparansiTabProps {
  isAdmin: boolean;
  kasRT: number;
  kasLedger: LedgerTransaction[];
  onAddTransaction: (tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => void;
  onEditTransaction: (id: number, tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => void;
  onDeleteTransaction: (id: number) => void;
}

export const TransparansiTab: React.FC<TransparansiTabProps> = ({
  isAdmin,
  kasRT,
  kasLedger,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // State Cash Ledger CRUD
  const [showAddTxForm, setShowAddTxForm] = React.useState(false);
  const [newTxTanggal, setNewTxTanggal] = React.useState('');
  const [newTxKeterangan, setNewTxKeterangan] = React.useState('');
  const [newTxJenis, setNewTxJenis] = React.useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [newTxJumlah, setNewTxJumlah] = React.useState('');
  const [editingTransaction, setEditingTransaction] = React.useState<LedgerTransaction | null>(null);
  const [editTxTanggal, setEditTxTanggal] = React.useState('');
  const [editTxKeterangan, setEditTxKeterangan] = React.useState('');
  const [editTxJenis, setEditTxJenis] = React.useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [editTxJumlah, setEditTxJumlah] = React.useState('');

  // Format angka rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 select-none">
        <div className="flex items-center gap-2.5">
          <Wallet className="text-civic-primary shrink-0" size={20} />
          <h3 className="text-sm md:text-base font-extrabold text-slate-805">Transparansi Laporan Keuangan RT</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-extrabold">Periode: Juni 2026</span>
          {isAdmin && (
            <button
              onClick={() => setShowAddTxForm(!showAddTxForm)}
              className="bg-civic-primary hover:opacity-90 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              Tambah Transaksi
            </button>
          )}
        </div>
      </div>

      {/* Form Tambah Transaksi Kas (Admin Only) */}
      {isAdmin && showAddTxForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const parsedJumlah = parseInt(newTxJumlah, 10);
            if (newTxTanggal.trim() && newTxKeterangan.trim() && !isNaN(parsedJumlah)) {
              onAddTransaction(newTxTanggal.trim(), newTxKeterangan.trim(), newTxJenis, parsedJumlah);
              setNewTxTanggal('');
              setNewTxKeterangan('');
              setNewTxJumlah('');
              setShowAddTxForm(false);
              alert('Transaksi baru berhasil ditambahkan!');
            } else {
              alert('Harap isi data transaksi dengan valid!');
            }
          }}
          className="bg-slate-50 border border-slate-205 rounded-2xl p-4 mb-4 space-y-3.5 text-xs select-none shadow-3xs animate-fade-in"
        >
          <span className="block font-bold text-slate-800 text-xs">Pencatatan Transaksi Kas Baru</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tanggal:</label>
              <input
                type="text"
                placeholder="Contoh: 20 Juni 2026"
                required
                value={newTxTanggal}
                onChange={(e) => setNewTxTanggal(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Keterangan Transaksi:</label>
              <input
                type="text"
                placeholder="Contoh: Iuran Keamanan"
                required
                value={newTxKeterangan}
                onChange={(e) => setNewTxKeterangan(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jenis:</label>
              <select
                value={newTxJenis}
                onChange={(e) => setNewTxJenis(e.target.value as any)}
                className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="pemasukan">Pemasukan (Kas Bertambah)</option>
                <option value="pengeluaran">Pengeluaran (Kas Berkurang)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jumlah (Rupiah):</label>
              <input
                type="number"
                placeholder="Contoh: 500000"
                required
                value={newTxJumlah}
                onChange={(e) => setNewTxJumlah(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none font-bold text-slate-800"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="submit"
              className="bg-civic-primary hover:opacity-90 text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer"
            >
              Simpan Transaksi
            </button>
            <button
              type="button"
              onClick={() => setShowAddTxForm(false)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-655 font-bold py-1.5 px-4 rounded-xl cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-450 text-[10px] uppercase font-extrabold tracking-wider">
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">Keterangan Transaksi</th>
              <th className="py-2.5 px-3 text-center">Jenis</th>
              <th className="py-2.5 px-3 text-right">Jumlah</th>
              {isAdmin && <th className="py-2.5 px-3 text-center select-none">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
            {kasLedger.map((tx) => {
              const isIncome = tx.jenis === 'pemasukan';
              return (
                <tr key={tx.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-slate-450 font-medium whitespace-nowrap">{tx.tanggal}</td>
                  <td className="py-3 px-3 font-extrabold text-slate-800">{tx.keterangan}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isIncome 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isIncome ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {tx.jenis}
                    </span>
                  </td>
                  <td className={`py-3 px-3 text-right font-black whitespace-nowrap ${
                    isIncome ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {isIncome ? '+' : '-'} {formatRupiah(tx.jumlah)}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-3 text-center whitespace-nowrap select-none">
                      <div className="flex gap-1.5 justify-center items-center">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setEditTxTanggal(tx.tanggal);
                            setEditTxKeterangan(tx.keterangan);
                            setEditTxJenis(tx.jenis);
                            setEditTxJumlah(tx.jumlah.toString());
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer animate-fade-in"
                          title="Edit Transaksi"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus transaksi "${tx.keterangan}"?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer animate-fade-in"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 flex items-center justify-between mt-4 select-none">
        <span className="text-xs text-slate-500 font-extrabold">Total Laporan Saldo Buku Kas RT:</span>
        <span className="text-sm md:text-base font-black text-slate-800">{formatRupiah(kasRT)}</span>
      </div>

      {/* Modal Edit Transaksi Kas */}
      {isAdmin && editingTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-805">Edit Catatan Keuangan</h3>
              <button 
                onClick={() => { setEditingTransaction(null); }}
                className="text-slate-400 hover:text-slate-655 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsedJumlah = parseInt(editTxJumlah, 10);
                if (editTxTanggal.trim() && editTxKeterangan.trim() && !isNaN(parsedJumlah)) {
                  onEditTransaction(editingTransaction.id, editTxTanggal.trim(), editTxKeterangan.trim(), editTxJenis, parsedJumlah);
                  setEditingTransaction(null);
                  alert('Catatan transaksi kas berhasil diperbarui!');
                } else {
                  alert('Harap isi data transaksi dengan valid!');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal:</label>
                  <input
                    type="text"
                    required
                    value={editTxTanggal}
                    onChange={(e) => setEditTxTanggal(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Transaksi:</label>
                  <select
                    value={editTxJenis}
                    onChange={(e) => setEditTxJenis(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="pemasukan">Pemasukan (Kas Bertambah)</option>
                    <option value="pengeluaran">Pengeluaran (Kas Berkurang)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Transaksi:</label>
                <input
                  type="text"
                  required
                  value={editTxKeterangan}
                  onChange={(e) => setEditTxKeterangan(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah (Rupiah):</label>
                <input
                  type="number"
                  required
                  value={editTxJumlah}
                  onChange={(e) => setEditTxJumlah(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-bold focus:outline-none"
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
                  onClick={() => setEditingTransaction(null)}
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
