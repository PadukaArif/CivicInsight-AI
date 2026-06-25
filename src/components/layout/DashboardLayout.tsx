import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from '../ui/footer';
import { Shield, Mail, MessageSquare } from 'lucide-react';
import logoImg from '../../logo.png';

/**
 * Interface props untuk komponen DashboardLayout.
 */
export interface DashboardLayoutProps {
  children: React.ReactNode; // Konten utama halaman yang akan di-render di dalam layout
  currentTab: string; // ID tab aktif saat ini (misal: "beranda")
  onTabChange: (tabId: string) => void; // Callback ketika tab navigasi diubah
  isAdmin: boolean; // Menunjukkan apakah peran saat ini adalah Admin/Pengurus
  activeRtRw: string; // RT/RW terpilih saat ini
  onRtRwChange: (value: string) => void; // Callback ketika pilihan RT/RW diubah
  onLogout: () => void; // Callback ketika user keluar
}

/**
 * Pemetaan ID Tab ke judul deskriptif bahasa Indonesia
 */
const getTabTitle = (tabId: string, isAdmin: boolean): string => {
  const titles: Record<string, string> = {
    'beranda': isAdmin ? 'Dashboard Pengurus RT/RW' : 'Beranda Utama Warga',
    'konsultasi-ai': 'Konsultasi Asisten AI Warga',
    'cek-fakta': 'Cek Fakta & Hoaks',
    'kelola-cek-fakta': 'Kelola & Verifikasi Isu Warga',
    'lapor-aduan': 'Layanan Laporan Warga',
    'kelola-aduan': 'Kelola & Tindak Lanjut Aduan Warga',
    'evaluasi-ai': 'Evaluasi AI & Layanan Publik',
    'statistik': 'Statistik & Analisis Kependudukan',
    'pengaturan': 'Pengaturan Portal Warga',
  };
  return titles[tabId] || 'Dashboard CivicInsight AI';
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentTab,
  onTabChange,
  isAdmin,
  activeRtRw,
  onRtRwChange,
  onLogout,
}) => {
  // State lokal untuk melacak buka-tutup Sidebar di layar mobile
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Fungsi toggle sidebar mobile
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const mainRef = React.useRef<HTMLElement>(null);

  // Scroll kembali ke atas saat tab navigasi berubah
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentTab]);

  // Mendapatkan judul halaman saat ini secara dinamis sesuai peran
  const pageTitle = getTabTitle(currentTab, isAdmin);

  return (
    /* 
      Container Utama: Menambahkan kelas 'theme-admin' secara dinamis 
      untuk memicu pergantian warna primer dari Hijau/Teal ke Biru Royal.
    */
    <div className={`min-h-screen flex flex-col bg-civic-bg text-civic-text font-sans antialiased ${isAdmin ? 'theme-admin' : ''}`}>
      {/* 
        Komponen Sidebar (Laci Navigasi Kiri):
        Hanya aktif dan me-render laci geser di resolusi mobile (< md).
      */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={onTabChange}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isAdmin={isAdmin}
        onLogout={onLogout}
      />

      {/* Area Utama: Terdiri dari Header (Atas) dan Area Konten (Bawah) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 
          Komponen Header (Bilah Atas):
          Sekarang menampung Navigasi Horizontal untuk laptop (md:flex).
        */}
        <Header
          onToggleSidebar={toggleSidebar}
          isAdmin={isAdmin}
          activeRtRw={activeRtRw}
          onRtRwChange={onRtRwChange}
          currentTabTitle={pageTitle}
          currentTab={currentTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
        />
        {/* 
          Area Konten Halaman:
          Menggunakan overflow-y-auto agar area ini dapat di-scroll secara independen.
        */}
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto pt-20 pb-4 px-4 md:p-6 focus:outline-none"
          tabIndex={-1}
        >
          <div className="max-w-6xl mx-auto w-full flex flex-col min-h-[calc(100vh-8rem)]">
            <div className="flex-1">
              {children}
            </div>

            <Footer
              logo={<img src={logoImg} alt="CivicInsight Logo" className="h-10 w-auto object-contain shrink-0" />}
              brandName="CivicInsight"
              socialLinks={[
                {
                  icon: <MessageSquare className="h-4 w-4" />,
                  href: "https://wa.me/6281234567890",
                  label: "WhatsApp Pengurus",
                },
                {
                  icon: <Mail className="h-4 w-4" />,
                  href: "mailto:rt04rw02@civicinsight.id",
                  label: "Email Pengurus",
                },
              ]}
              mainLinks={[
                { href: "#beranda", label: "Beranda Utama", id: "beranda" },
                { href: "#konsultasi-ai", label: "Konsultasi AI", id: "konsultasi-ai" },
                { href: "#cek-fakta", label: "Cek Fakta", id: "cek-fakta" },
                { href: "#lapor-aduan", label: "Lapor Aduan", id: "lapor-aduan" },
                { href: "#pengaturan", label: "Pengaturan", id: "pengaturan" },
              ]}
              legalLinks={[
                { href: "#privacy", label: "Kebijakan Privasi" },
                { href: "#terms", label: "Ketentuan Penggunaan" },
              ]}
              copyright={{
                text: `© 2026 CivicInsight AI. Lingkungan ${activeRtRw}.`,
                license: "Hak Cipta Dilindungi Undang-Undang",
              }}
              onLinkClick={onTabChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
