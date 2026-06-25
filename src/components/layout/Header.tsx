import React from 'react';
import { Menu, ChevronDown, Home, Sparkles, ShieldCheck, Megaphone, Settings, ClipboardList, ShieldAlert, Bot, TrendingUp, MapPin, LogOut } from 'lucide-react';
import { ExpandableTabs } from '../ui/expandable-tabs';
import logoImg from '../../logo.png';

/**
 * Interface props untuk komponen Header.
 */
export interface HeaderProps {
  onToggleSidebar: () => void; // Fungsi untuk membuka/menutup Sidebar laci di mobile
  isAdmin: boolean; // Menunjukkan apakah peran saat ini adalah Admin/Pengurus
  activeRtRw: string; // RT/RW terpilih saat ini
  onRtRwChange: (value: string) => void; // Callback ketika pilihan RT/RW diubah
  currentTabTitle: string; // Judul modul aktif saat ini
  currentTab: string; // Tab aktif saat ini untuk menyoroti link di navbar desktop
  onTabChange: (tabId: string) => void; // Callback ketika tab diubah dari navbar desktop
  onLogout: () => void; // Callback ketika user log out
}

/**
 * Interface data untuk Item Menu Navigasi
 */
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/**
 * Daftar navigasi untuk Warga Biasa (Desktop Navbar)
 */
const wargaMenuItems: MenuItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'konsultasi-ai', label: 'Konsultasi AI', icon: Sparkles },
  { id: 'cek-fakta', label: 'Cek Fakta', icon: ShieldCheck },
  { id: 'lapor-aduan', label: 'Lapor Aduan', icon: Megaphone },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

/**
 * Daftar navigasi untuk Pengurus RT/RW (Desktop Navbar)
 */
const adminMenuItems: MenuItem[] = [
  { id: 'beranda', label: 'Dashboard', icon: Home },
  { id: 'kelola-aduan', label: 'Aduan', icon: ClipboardList },
  { id: 'kelola-cek-fakta', label: 'Cek Fakta', icon: ShieldAlert },
  { id: 'evaluasi-ai', label: 'Evaluasi AI', icon: Bot },
  { id: 'statistik', label: 'Statistik', icon: TrendingUp },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

// Daftar RT/RW aktif dalam simulasi
const rtRwList = [
  'RT 01 / RW 02',
  'RT 02 / RW 02',
  'RT 03 / RW 02',
  'RT 04 / RW 02',
  'RT 05 / RW 02',
];

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isAdmin,
  activeRtRw,
  onRtRwChange,
  currentTabTitle,
  currentTab,
  onTabChange,
  onLogout,
}) => {
  // Ambil daftar menu horizontal sesuai peran aktif
  const desktopMenuItems = isAdmin ? adminMenuItems : wargaMenuItems;

  const desktopTabs = React.useMemo(() => {
    return desktopMenuItems.map((item) => ({
      id: item.id,
      title: item.label,
      icon: item.icon as any,
    }));
  }, [desktopMenuItems]);
  return (
    <header className="fixed md:sticky top-0 left-0 right-0 h-16 bg-civic-surface border-b border-slate-200 shadow-xs flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between px-4 md:px-6 z-40 select-none">

      {/* KIRI: Logo Desktop & Hamburger Mobile */}
      <div className="flex items-center gap-3 shrink-0 md:justify-self-start">
        {/* Tombol Hamburger - hanya muncul di mobile (md:hidden) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:ring-2 focus:ring-civic-primary focus:outline-none"
          aria-label="Buka Menu Samping"
        >
          <Menu size={24} />
        </button>

        {/* Logo Platform - Tampil khusus di Desktop (md:flex) */}
        <div className="hidden md:flex items-center gap-3 select-none shrink-0">
          <img src={logoImg} alt="CivicInsight Logo" className="h-14 w-auto object-contain" />
          <div className="h-8 w-[1px] bg-slate-200" />
          <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg ${
            isAdmin 
              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-250'
          }`}>
            {isAdmin ? 'Panel Pengurus' : 'Layanan Warga'}
          </span>
        </div>

        {/* Judul Halaman Aktif - Hanya tampil di Mobile */}
        <h1 className="text-slate-800 font-bold text-base md:hidden tracking-tight">
          {currentTabTitle}
        </h1>
      </div>

      {/* TENGAH: Menu Navigasi Tengah-Atas (Centered on Desktop) */}
      <div className="hidden md:flex justify-self-center z-20">
        <ExpandableTabs
          tabs={desktopTabs}
          activeTabId={currentTab}
          activeColor="text-civic-primary font-black"
          onChange={(id) => {
            if (id) {
              onTabChange(id);
            }
          }}
        />
      </div>

      {/* KANAN: Selektor RT/RW, Badge Peran, & Informasi Pengguna */}
      <div className="flex items-center gap-3 md:gap-5 md:justify-self-end">
        {/* Selektor RT/RW - Made static & read-only */}
        <div className="bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 select-none">
          <MapPin size={13} className="text-civic-primary shrink-0" />
          <span>RT 04 / RW 02</span>
        </div>

        {/* Badge Peran Aktif (Warga / Admin) - Admin dirubah dari Gold ke Biru */}
        {isAdmin ? (
          <span className="hidden lg:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            Pengurus RT/RW
          </span>
        ) : (
          <span className="hidden lg:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Warga Biasa
          </span>
        )}

        {/* Profil Singkat Pengguna */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-slate-800 font-bold text-xs leading-tight">
              {isAdmin ? 'Pak Pengurus' : 'Halo, Warga!'}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {isAdmin ? 'Akses Admin' : 'Akses Terbatas'}
            </p>
          </div>

          {/* Avatar User - Admin dirubah dari bg-amber-600 ke bg-blue-600 */}
          <div
            className={`w-8 h-8 rounded-full font-black flex items-center justify-center border-2 border-white shadow-xs shrink-0 select-none text-white text-xs ${
              isAdmin 
                ? 'bg-blue-600' 
                : 'bg-teal-600'
            }`}
            title={isAdmin ? 'Profil Pengurus' : 'Profil Warga'}
          >
            {isAdmin ? 'P' : 'W'}
          </div>

          {/* Tombol Keluar / Logout */}
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            title="Keluar dari Portal"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
