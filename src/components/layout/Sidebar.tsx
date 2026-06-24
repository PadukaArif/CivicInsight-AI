import React from 'react';
import { Home, Sparkles, ShieldCheck, Megaphone, Settings, X, Info, ClipboardList, ShieldAlert, Bot, TrendingUp, LogOut } from 'lucide-react';
import logoImg from '../../logo.png';

/**
 * Interface props untuk komponen Sidebar.
 */
export interface SidebarProps {
  currentTab: string; // Tab aktif saat ini
  onTabChange: (tabId: string) => void; // Callback ketika tab diubah
  isOpen: boolean; // Menunjukkan status apakah menu laci mobile terbuka
  onClose: () => void; // Fungsi callback untuk menutup menu laci mobile
  isAdmin: boolean; // Menentukan daftar navigasi yang dirender
  onLogout: () => void; // Callback ketika user log out
}

/**
 * Interface data untuk Item Menu Navigasi
 */
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag?: string; // Tag opsional (misal: "Baru", "Penting")
}

/**
 * Daftar navigasi untuk peran Warga Biasa (Mobile Drawer)
 */
const wargaMenuItems: MenuItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'konsultasi-ai', label: 'Konsultasi AI', icon: Sparkles, tag: 'AI Baru' },
  { id: 'cek-fakta', label: 'Cek Fakta', icon: ShieldCheck },
  { id: 'lapor-aduan', label: 'Lapor Aduan', icon: Megaphone },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

/**
 * Daftar navigasi untuk peran Pengurus RT/RW (Admin Mobile Drawer)
 */
const adminMenuItems: MenuItem[] = [
  { id: 'beranda', label: 'Dashboard', icon: Home },
  { id: 'kelola-aduan', label: 'Aduan', icon: ClipboardList, tag: 'Aduan' },
  { id: 'kelola-cek-fakta', label: 'Cek Fakta', icon: ShieldAlert },
  { id: 'evaluasi-ai', label: 'Evaluasi AI', icon: Bot, tag: 'AI' },
  { id: 'statistik', label: 'Statistik', icon: TrendingUp },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpen,
  onClose,
  isAdmin,
  onLogout,
}) => {
  // Ambil daftar menu sesuai dengan peran aktif saat ini
  const activeMenuItems = isAdmin ? adminMenuItems : wargaMenuItems;

  // Render konten menu utama (dipakai di dalam laci mobile)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-civic-surface text-civic-text border-r border-slate-200">
      {/* Bagian Atas: Logo dan Judul Platform */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="CivicInsight Logo" className="h-14 w-auto object-contain" />
          <div className="h-8 w-[1px] bg-slate-200" />
          <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md ${
            isAdmin 
              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-250'
          }`}>
            {isAdmin ? 'Pengurus' : 'Warga'}
          </span>
        </div>
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-civic-primary"
          aria-label="Tutup Menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* Bagian Tengah: Daftar Navigasi Utama */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {activeMenuItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose(); // Otomatis tutup laci jika di layar mobile
              }}
              // Memastikan target klik yang luas (minimal 48px tinggi) demi kemudahan lansia
              className={`w-full flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-civic-primary ${
                isActive
                  ? 'bg-teal-50/60 text-civic-primary border-l-4 border-civic-primary font-bold'
                  : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-l-4 border-transparent'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  size={20}
                  className={isActive ? 'text-civic-primary' : 'text-slate-500'}
                />
                <span className="text-base">{item.label}</span>
              </div>

              {/* Tag Penanda Tambahan */}
              {item.tag && (
                <span
                  className={`rounded-full font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 ${
                    isActive ? 'bg-civic-primary text-white' : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bagian Bawah: Informasi Pengguna & Hak Cipta */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-teal-50/40 border border-teal-100/50">
          <Info size={18} className="text-civic-primary shrink-0 mt-0.5" />
          <p className="text-slate-600 leading-snug text-xs">
            {isAdmin 
              ? 'Tanggapan Anda langsung muncul di dashboard warga secara real-time.'
              : 'Laporan Anda langsung diteruskan ke Pengurus RT secara real-time.'}
          </p>
        </div>
        
        {/* Tombol Keluar untuk Mobile */}
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full mt-3.5 flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <LogOut size={14} />
          Keluar dari Akun
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-4">
          © 2026 CivicInsight AI.
        </p>
      </div>
    </div>
  );

  return (
    /* LAYOUT MOBILE: Hanya me-render laci geser jika di layar HP (< md) */
    <div
      className={`fixed inset-0 z-50 md:hidden transition-opacity duration-305 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop Gelap yang dapat diklik untuk menutup */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Laci Navigasi Geser (Drawer) */}
      <div
        className={`absolute top-0 left-0 w-72 h-full shadow-2xl transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent()}
      </div>
    </div>
  );
};
