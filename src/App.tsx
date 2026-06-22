import React from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import type { Announcement, Aduan, Fact, Rumor, ChatMessage, LedgerTransaction, FamilyMember, Household } from './types';

// Import komponen-komponen view yang sudah modular
import { BerandaView } from './components/views/BerandaView';
import { KonsultasiAIView } from './components/views/KonsultasiAIView';
import { CekFaktaView } from './components/views/CekFaktaView';
import { LaporAduanView } from './components/views/LaporAduanView';
import { PengaturanView } from './components/views/PengaturanView';
import { StatistikView } from './components/views/StatistikView';
import { EvaluasiAIView } from './components/views/EvaluasiAIView';

import './index.css';

export function App() {
  // ======================== STATE GLOBAL SIMULASI ========================
  // Melacak peran aktif: Warga Biasa (false) vs Pengurus RT/RW Admin (true)
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  
  // Melacak RT/RW aktif dalam simulasi sistem multi-RT/RW
  const [activeRtRw, setActiveRtRw] = React.useState<string>('RT 04 / RW 02');

  // Melacak tab aktif saat ini
  const [currentTab, setCurrentTab] = React.useState<string>('beranda');

  // State untuk survey kenyamanan lingkungan mingguan
  const [pollResults, setPollResults] = React.useState({
    sangat_nyaman: 18,
    biasa_saja: 11,
    cukup_khawatir: 5
  });
  const [userVoted, setUserVoted] = React.useState<string | null>(null);

  // State Obrolan Chatbot Evaluasi AI Admin
  const [evalMessages, setEvalMessages] = React.useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Halo Pak Pengurus RT/RW! Saya Asisten AI Evaluasi Layanan Publik. Saya siap menyajikan data selama sebulan ini dan mengevaluasi kinerja layanan publik di RT 04.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isEvalTyping, setIsEvalTyping] = React.useState<boolean>(false);

  // Statistik RT/RW yang disimpan terpusat (dapat diedit oleh admin)
  const [totalWarga, setTotalWarga] = React.useState<number>(240);
  const [kasRT, setKasRT] = React.useState<number>(5250000);
  const [poinWarga, setPoinWarga] = React.useState<number>(85); // Poin Keaktifan Warga (Simulasi penghargaan)

  // Jadwal operasional RT/RW (dapat diedit oleh admin)
  const [jamSampah, setJamSampah] = React.useState<string>('08:00 - 10:00 WIB');
  const [jamOperasional, setJamOperasional] = React.useState<string>('Senin - Jumat, 19:00 - 21:00 WIB');

  // State Kontak Darurat RT/RW (dapat di-CRUD oleh admin)
  const [emergencyContacts, setEmergencyContacts] = React.useState([
    { id: 1, nama: 'Bhabinkamtibmas (Polsek)', nomor: '0811-2233-4455' },
    { id: 2, nama: 'Pemadam Kebakaran', nomor: '021-5544-3322' },
    { id: 3, nama: 'Ambulans Siaga', nomor: '021-9988-7766' },
    { id: 4, nama: 'Ketua RW 02 (Bp. H. Mulyadi)', nomor: '0813-8877-6655' },
  ]);

  // 1. State Pengumuman RT/RW
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([
    {
      id: 1,
      kategori: 'Penting',
      judul: 'Kerja Bakti Saluran Air',
      konten: 'Diharapkan kehadiran perwakilan satu warga per rumah untuk membersihkan selokan mengantisipasi datangnya musim penghujan pada Minggu, 28 Juni pukul 07:00 WIB.',
      tanggal: '22 Juni 2026',
      urgensi: 'high',
    },
    {
      id: 2,
      kategori: 'Kegiatan',
      judul: 'Jadwal Imunisasi Balita',
      konten: 'Imunisasi dasar polio, DPT, dan campak gratis untuk balita usia di bawah 5 tahun dilaksanakan di Posyandu Pos 1 Balai Warga sabtu depan pukul 08:00.',
      tanggal: '18 Juni 2026',
      urgensi: 'normal',
    },
  ]);

  // 2. State Obrolan AI (Konsultasi Warga) - Menggunakan waktu JS real-time dunia nyata
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya Asisten AI RT/RW. Ada yang bisa saya bantu hari ini? Anda bisa menanyakan cara mengurus KTP, jadwal posyandu, syarat pembuatan KK, atau iuran warga.',
      time: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), // 5 menit yang lalu dari waktu lokal riil
    },
  ]);
  const [isTyping, setIsTyping] = React.useState<boolean>(false);

  // 3. State Cek Fakta (Informasi Resmi vs Isu/Hoaks)
  const [verifiedFacts, setVerifiedFacts] = React.useState<Fact[]>([
    {
      id: 1,
      judul: 'Kegiatan Fogging Nyamuk DBD Sabtu Tanggal 15 Juni',
      penjelasan: 'Pihak Puskesmas membenarkan adanya jadwal pengasapan (fogging) nyamuk demam berdarah di lingkungan RT 04. Kegiatan ini gratis tanpa dipungut iuran tambahan sepeser pun. Mohon warga menutup makanan sebelum fogging.',
      status: 'fakta',
      tanggal: '14 Juni 2026',
      sumber: 'Puskesmas Kelurahan',
    },
    {
      id: 2,
      judul: 'Pencuri Menyamar Petugas PLN di RW 02',
      penjelasan: 'Berdasarkan koordinasi dengan Polsek dan Bhabinkamtibmas setempat, kabar adanya begal atau pencuri menyamar petugas PLN di area RW 02 adalah HOAKS. Mohon warga tetap waspada namun tidak menyebarkan isu panik. Petugas resmi PLN wajib menunjukkan ID Card resmi.',
      status: 'hoaks',
      tanggal: '11 Juni 2026',
      sumber: 'Polsek Kecamatan',
    },
  ]);

  const [submittedRumors, setSubmittedRumors] = React.useState<Rumor[]>([
    {
      id: 1,
      konten: 'Katanya RT 04 membagikan paket sembako gratis besok pagi di kelurahan, apa benar Pak RT?',
      wargaNama: 'Budi Santoso',
      tanggal: '21 Juni 2026',
      status: 'belum_verifikasi',
    },
  ]);

  // 4. State Aduan Warga
  const [aduanList, setAduanList] = React.useState<Aduan[]>([
    {
      id: 1,
      wargaNama: 'Ahmad Dahlan',
      kategori: 'Infrastruktur',
      deskripsi: 'Lampu jalan di dekat pertigaan gang 3 mati total, membahayakan warga saat pulang kerja malam.',
      lokasi: 'Depan rumah No. 27',
      status: 'Diproses',
      tanggal: '20 Juni 2026',
      tanggapanAdmin: 'Kami sudah melaporkannya ke dinas penerangan kelurahan dan sedang menunggu konfirmasi tanggal pengerjaan.',
      tanggalTanggapan: '21 Juni 2026',
    },
    {
      id: 2,
      wargaNama: 'Siti Rahma',
      kategori: 'Kebersihan',
      deskripsi: 'Sampah di tempat sampah umum belum diangkut selama 3 hari, menumpuk dan menimbulkan bau menyengat.',
      lokasi: 'Area taman bermain RT 04',
      status: 'Selesai',
      tanggal: '18 Juni 2026',
      tanggapanAdmin: 'Mobil pengangkut sampah sudah datang kemarin sore dan membersihkan area taman. Mohon warga membuang sampah di tempatnya masing-masing.',
      tanggalTanggapan: '19 Juni 2026',
    },
  ]);

  // 5. State Transparansi Keuangan (Ledger Keuangan RT)
  const [kasLedger, setKasLedger] = React.useState<LedgerTransaction[]>([
    { id: 1, tanggal: '10 Juni 2026', keterangan: 'Iuran Bulanan Warga RT 04', jenis: 'pemasukan', jumlah: 4500000 },
    { id: 2, tanggal: '12 Juni 2026', keterangan: 'Pembelian Alat Fogging Demam Berdarah', jenis: 'pengeluaran', jumlah: 750000 },
    { id: 3, tanggal: '15 Juni 2026', keterangan: 'Pembayaran Listrik Lampu Jalan Gang 1-4', jenis: 'pengeluaran', jumlah: 300000 },
    { id: 4, tanggal: '18 Juni 2026', keterangan: 'Donasi Sosial Warga untuk Anak Yatim', jenis: 'pemasukan', jumlah: 1000000 },
  ]);

  // 6. State Data Kartu Keluarga Warga & Lingkungan (RT/RW)
  const [households, setHouseholds] = React.useState<Household[]>([
    {
      id: 1,
      kepalaKeluarga: 'Warga Teladan RT 04',
      noKk: '3273012903120004',
      alamat: 'Jl. Mawar Indah Gang 2 No. 12',
      noHp: '0812-9988-7766',
      members: [
        {
          id: 1,
          nama: 'Warga Teladan RT 04',
          nik: '3273012903120004',
          tglLahir: '1985-05-12',
          pekerjaan: 'Karyawan Swasta',
          hubungan: 'Kepala Keluarga',
          statusKawin: 'Kawin',
          pendidikan: 'S1',
        },
        {
          id: 2,
          nama: 'Siti Aisyah',
          nik: '3273012903120005',
          tglLahir: '1988-08-20',
          pekerjaan: 'Ibu Rumah Tangga',
          hubungan: 'Istri',
          statusKawin: 'Kawin',
          pendidikan: 'SMA/SMK',
        },
        {
          id: 3,
          nama: 'Budi Santoso',
          nik: '3273012903120006',
          tglLahir: '2012-10-15',
          pekerjaan: 'Pelajar',
          hubungan: 'Anak',
          statusKawin: 'Belum Kawin',
          pendidikan: 'SMP',
        },
      ]
    },
    {
      id: 2,
      kepalaKeluarga: 'Ahmad Dahlan',
      noKk: '3273012903120001',
      alamat: 'Jl. Mawar Indah Gang 3 No. 27',
      noHp: '0812-1111-2222',
      members: [
        {
          id: 4,
          nama: 'Ahmad Dahlan',
          nik: '3273012903120001',
          tglLahir: '1978-02-15',
          pekerjaan: 'PNS',
          hubungan: 'Kepala Keluarga',
          statusKawin: 'Kawin',
          pendidikan: 'S1',
        },
        {
          id: 5,
          nama: 'Aminah Dahlan',
          nik: '3273012903120002',
          tglLahir: '1982-11-24',
          pekerjaan: 'Karyawan Swasta',
          hubungan: 'Istri',
          statusKawin: 'Kawin',
          pendidikan: 'D3',
        }
      ]
    },
    {
      id: 3,
      kepalaKeluarga: 'Siti Rahma',
      noKk: '3273012903120010',
      alamat: 'Jl. Mawar Indah Gang 1 No. 5',
      noHp: '0813-4444-5555',
      members: [
        {
          id: 6,
          nama: 'Siti Rahma',
          nik: '3273012903120010',
          tglLahir: '1990-09-09',
          pekerjaan: 'Wiraswasta',
          hubungan: 'Kepala Keluarga',
          statusKawin: 'Cerai Mati',
          pendidikan: 'S1',
        },
        {
          id: 7,
          nama: 'Rizky Pratama',
          nik: '3273012903120011',
          tglLahir: '2015-04-12',
          pekerjaan: 'Pelajar',
          hubungan: 'Anak',
          statusKawin: 'Belum Kawin',
          pendidikan: 'SD',
        }
      ]
    }
  ]);

  // ======================== HANDLERS (SIAP API BACKEND) ========================

  // A. Mengganti Peran (Simulasi Login/Keluar)
  const handleToggleRole = (admin: boolean) => {
    setIsAdmin(admin);
    // Reset ke beranda agar tidak ada error layout akibat tab tak terdaftar pada peran baru
    setCurrentTab('beranda');
  };

  // B. Mengubah Data Statistik RT/RW (Admin Only)
  const handleUpdateStats = (warga: number, kas: number, poin: number) => {
    setTotalWarga(warga);
    setKasRT(kas);
    setPoinWarga(poin);
  };

  // B2. Mengubah Jadwal Operasional RT/RW (Admin Only)
  const handleUpdateSchedules = (sampah: string, operasional: string) => {
    setJamSampah(sampah);
    setJamOperasional(operasional);
  };

  // C. Menambah Pengumuman Baru (Admin Only)
  const handleAddAnnouncement = (
    judul: string,
    konten: string,
    kategori: 'Penting' | 'Umum' | 'Kegiatan',
    urgensi: 'high' | 'normal'
  ) => {
    const newAnn: Announcement = {
      id: Date.now(),
      kategori,
      judul,
      konten,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      urgensi,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  // D. Menghapus Pengumuman (Admin Only)
  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
  };

  // E. Mengirim Pertanyaan Ke Asisten AI (Warga) - Jam Real-Time
  const handleSendChatMessage = async (text: string) => {
    const userTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    // 1. Simpan pesan warga terlebih dahulu
    setChatMessages((prev) => [...prev, { sender: 'user', text, time: userTime }]);
    setIsTyping(true);

    try {
      // Simulasi delay jaringan (1.2 detik)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let aiReply = 'Maaf, saya tidak menemukan informasi spesifik mengenai hal tersebut di database RT/RW setempat. Silakan ajukan aduan resmi ke pengurus RT melalui menu Lapor Aduan.';
      
      const lower = text.toLowerCase();
      if (lower.includes('ktp') || lower.includes('identitas')) {
        aiReply = `Untuk mengurus KTP baru, rusak, atau hilang di wilayah ${activeRtRw}, silakan siapkan berkas:\n1. Fotokopi Kartu Keluarga (KK)\n2. Surat Pengantar RT/RW (bisa diajukan lewat menu Lapor Aduan)\n3. Dokumen KTP lama (jika rusak) atau Surat Kehilangan Kepolisian (jika hilang).\nBerkas tersebut dapat diserahkan ke Kantor Kelurahan pada hari kerja.`;
      } else if (lower.includes('posyandu') || lower.includes('imunisasi')) {
        aiReply = `Jadwal pelayanan Posyandu Balita & Lansia di ${activeRtRw} diadakan rutin setiap hari Sabtu minggu kedua tiap bulannya di Balai Warga. Pelayanan dimulai pukul 08:00 s.d 11:00 WIB.`;
      } else if (lower.includes('kas') || lower.includes('iuran') || lower.includes('bayar')) {
        aiReply = `Iuran warga bulanan wajib di ${activeRtRw} adalah Rp 50.000 (mencakup kas RT, kebersihan sampah umum, dan keamanan keamanan ronda). Pembayaran dapat ditransfer atau disetor tunai ke Bendahara RT (Ibu Retno).`;
      } else if (lower.includes('kk') || lower.includes('keluarga')) {
        aiReply = `Pembuatan Kartu Keluarga (KK) baru atau perubahan data (pecah KK) di wilayah ${activeRtRw} membutuhkan:\n1. Surat Pengantar RT/RW\n2. KK asli lama\n3. Buku Nikah / Akta Nikah (jika pengantin baru)\n4. Surat keterangan pindah (jika berasal dari luar kota).\nBawa seluruh dokumen ke loket kelurahan setempat.`;
      }

      const aiTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply, time: aiTime }]);
    } catch (err) {
      const errorTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev, 
        { sender: 'ai', text: 'Koneksi dengan asisten AI terputus. Harap periksa jaringan Anda.', time: errorTime }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // F. Melaporkan Rumor Isu Baru (Warga)
  const handleSubmitRumor = (konten: string) => {
    const newRumor: Rumor = {
      id: Date.now(),
      konten,
      wargaNama: 'Warga Teladan RT 04',
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'belum_verifikasi',
    };
    setSubmittedRumors((prev) => [newRumor, ...prev]);
  };

  // G. Memverifikasi Rumor Aduan Warga (Admin Only)
  const handleVerifyRumor = (id: number, status: 'fakta' | 'hoaks', penjelasan: string) => {
    const targetRumor = submittedRumors.find((r) => r.id === id);
    if (!targetRumor) return;

    const newFact: Fact = {
      id: Date.now(),
      judul: `Klarifikasi Isu: "${targetRumor.konten.substring(0, 50)}..."`,
      penjelasan,
      status,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      sumber: `Pengurus ${activeRtRw}`,
    };

    setVerifiedFacts((prev) => [newFact, ...prev]);
    setSubmittedRumors((prev) => prev.filter((r) => r.id !== id));
  };

  // H. Menghapus Rumor (Admin Only)
  const handleDeleteRumor = (id: number) => {
    setSubmittedRumors((prev) => prev.filter((r) => r.id !== id));
  };

  // I. Mempublikasikan Fakta Secara Langsung (Admin Only)
  const handleAddFact = (judul: string, penjelasan: string, status: 'fakta' | 'hoaks', sumber?: string) => {
    const newFact: Fact = {
      id: Date.now(),
      judul,
      penjelasan,
      status,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      sumber: sumber || `Pengurus ${activeRtRw}`,
    };
    setVerifiedFacts((prev) => [newFact, ...prev]);
  };

  // J. Menghapus Publikasi Fakta (Admin Only)
  const handleDeleteFact = (id: number) => {
    setVerifiedFacts((prev) => prev.filter((fact) => fact.id !== id));
  };

  // K. Membuat Aduan Baru (Warga)
  const handleSubmitAduan = (kategori: string, lokasi: string, deskripsi: string) => {
    const newAduan: Aduan = {
      id: Date.now(),
      wargaNama: 'Warga Teladan RT 04',
      kategori,
      lokasi,
      deskripsi,
      status: 'Terkirim',
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    setAduanList((prev) => [newAduan, ...prev]);
  };

  // L. Merespons & Mengubah Status Aduan Warga (Admin Only)
  const handleUpdateAduanStatus = (id: number, status: 'Terkirim' | 'Diproses' | 'Selesai', response?: string) => {
    setAduanList((prev) =>
      prev.map((aduan) => {
        if (aduan.id === id) {
          return {
            ...aduan,
            status,
            tanggapanAdmin: response,
            tanggalTanggapan: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          };
        }
        return aduan;
      })
    );
  };

  // M. Menghapus Aduan (Admin Only)
  const handleDeleteAduan = (id: number) => {
    setAduanList((prev) => prev.filter((a) => a.id !== id));
  };

  // N. Menambahkan Anggota Keluarga Baru (Warga & Admin)
  const handleAddFamilyMember = (member: Omit<FamilyMember, 'id'>, householdId: number = 1) => {
    const newMember: FamilyMember = {
      ...member,
      id: Date.now(),
    };
    setHouseholds((prev) =>
      prev.map((h) => {
        if (h.id === householdId) {
          return {
            ...h,
            members: [...h.members, newMember],
          };
        }
        return h;
      })
    );
  };

  // O. Menghapus Anggota Keluarga (Warga & Admin)
  const handleDeleteFamilyMember = (id: number) => {
    setHouseholds((prev) =>
      prev.map((h) => ({
        ...h,
        members: h.members.filter((m) => m.id !== id),
      }))
    );
  };

  // P. Mengedit Pengumuman (Admin Only)
  const handleEditAnnouncement = (id: number, judul: string, konten: string, kategori: 'Penting' | 'Umum' | 'Kegiatan', urgensi: 'high' | 'normal') => {
    setAnnouncements((prev) => prev.map((ann) => ann.id === id ? { ...ann, judul, konten, kategori, urgensi } : ann));
  };

  // Q. CRUD Kontak Darurat (Admin Only)
  const handleAddContact = (nama: string, nomor: string) => {
    setEmergencyContacts((prev) => [...prev, { id: Date.now(), nama, nomor }]);
  };
  const handleEditContact = (id: number, nama: string, nomor: string) => {
    setEmergencyContacts((prev) => prev.map((c) => c.id === id ? { ...c, nama, nomor } : c));
  };
  const handleDeleteContact = (id: number) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // R. CRUD Transaksi Kas (Admin Only)
  const handleAddTransaction = (tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => {
    setKasLedger((prev) => [...prev, { id: Date.now(), tanggal, keterangan, jenis, jumlah }]);
    setKasRT((prev) => jenis === 'pemasukan' ? prev + jumlah : prev - jumlah);
  };
  const handleEditTransaction = (id: number, tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => {
    const oldTx = kasLedger.find((t) => t.id === id);
    if (!oldTx) return;
    let tempKas = kasRT;
    if (oldTx.jenis === 'pemasukan') tempKas -= oldTx.jumlah;
    else tempKas += oldTx.jumlah;
    if (jenis === 'pemasukan') tempKas += jumlah;
    else tempKas -= jumlah;
    setKasRT(tempKas);
    setKasLedger((prev) => prev.map((t) => t.id === id ? { ...t, tanggal, keterangan, jenis, jumlah } : t));
  };
  const handleDeleteTransaction = (id: number) => {
    const oldTx = kasLedger.find((t) => t.id === id);
    if (!oldTx) return;
    if (oldTx.jenis === 'pemasukan') setKasRT((prev) => prev - oldTx.jumlah);
    else setKasRT((prev) => prev + oldTx.jumlah);
    setKasLedger((prev) => prev.filter((t) => t.id !== id));
  };

  // S. Edit Klarifikasi Fakta (Admin Only)
  const handleEditFact = (id: number, judul: string, penjelasan: string, status: 'fakta' | 'hoaks', sumber?: string) => {
    setVerifiedFacts((prev) => prev.map((f) => f.id === id ? { ...f, judul, penjelasan, status, sumber } : f));
  };

  // T. Edit Anggota Keluarga (Terbatas: Hanya Status & Pendidikan)
  const handleEditFamilyMember = (householdId: number, memberId: number, statusKawin: FamilyMember['statusKawin'], pendidikan: FamilyMember['pendidikan']) => {
    setHouseholds((prev) => prev.map((h) => {
      if (h.id === householdId) {
        return {
          ...h,
          members: h.members.map((m) => m.id === memberId ? { ...m, statusKawin, pendidikan } : m)
        };
      }
      return h;
    }));
  };

  // U. Edit Nomor KK (Admin & Warga)
  const handleEditHouseholdKk = (householdId: number, noKk: string) => {
    setHouseholds((prev) => prev.map((h) => h.id === householdId ? { ...h, noKk } : h));
  };

  // Vote comfort poll
  const handleVoteComfort = (choice: 'sangat_nyaman' | 'biasa_saja' | 'cukup_khawatir') => {
    if (userVoted) return;
    setPollResults(prev => ({
      ...prev,
      [choice]: prev[choice] + 1
    }));
    setUserVoted(choice);
  };

  // Chatbot Evaluasi AI Admin handler
  const handleSendEvalMessage = async (text: string) => {
    const userTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setEvalMessages(prev => [...prev, { sender: 'user', text, time: userTime }]);
    setIsEvalTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes('aduan') || lower.includes('lapor')) {
        const total = aduanList.length;
        const diproses = aduanList.filter(a => a.status === 'Diproses').length;
        const selesai = aduanList.filter(a => a.status === 'Selesai').length;
        const terkirim = aduanList.filter(a => a.status === 'Terkirim').length;
        reply = `**Analisis Layanan Publik (Aduan Warga):**\n` +
                `- Total aduan masuk bulan ini: **${total} laporan**.\n` +
                `- Status penyelesaian:\n` +
                `  * **${selesai} aduan** telah diselesaikan dengan sukses.\n` +
                `  * **${diproses} aduan** sedang aktif ditindaklanjuti.\n` +
                `  * **${terkirim} aduan** baru masuk dan perlu segera ditanggapi.\n\n` +
                `*Rekomendasi:* Segera tinjau laporan yang baru masuk agar tingkat respons layanan tetap optimal.`;
      } else if (lower.includes('keuangan') || lower.includes('kas') || lower.includes('transparansi')) {
        const totalPemasukan = kasLedger.filter(k => k.jenis === 'pemasukan').reduce((sum, item) => sum + item.jumlah, 0);
        const totalPengeluaran = kasLedger.filter(k => k.jenis === 'pengeluaran').reduce((sum, item) => sum + item.jumlah, 0);
        reply = `**Evaluasi Keuangan Kas RT (${activeRtRw}):**\n` +
                `- Saldo Kas saat ini: **Rp ${kasRT.toLocaleString('id-ID')}**.\n` +
                `- Akumulasi bulan ini:\n` +
                `  * Total Pemasukan: **Rp ${totalPemasukan.toLocaleString('id-ID')}**\n` +
                `  * Total Pengeluaran: **Rp ${totalPengeluaran.toLocaleString('id-ID')}**\n` +
                `- Rincian transaksi terakhir: **${kasLedger[kasLedger.length - 1]?.keterangan || 'N/A'}**.\n\n` +
                `*Evaluasi:* Aliran kas berjalan sehat dan transparan. Neraca menunjukkan surplus yang memadai untuk penanganan darurat lingkungan.`;
      } else if (lower.includes('survei') || lower.includes('lingkungan') || lower.includes('nyaman') || lower.includes('kesehatan')) {
        const totalVotes = pollResults.sangat_nyaman + pollResults.biasa_saja + pollResults.cukup_khawatir;
        reply = `**Analisis Survei Kenyamanan Lingkungan Warga:**\n` +
                `- Total warga berpartisipasi: **${totalVotes} orang**.\n` +
                `- Sebaran respon:\n` +
                `  * **Sangat Nyaman:** ${pollResults.sangat_nyaman} warga\n` +
                `  * **Biasa Saja:** ${pollResults.biasa_saja} warga\n` +
                `  * **Cukup Khawatir:** ${pollResults.cukup_khawatir} warga\n\n` +
                `*Analisis Kesehatan Lingkungan:* Mayoritas warga merasa aman dan nyaman. Namun, sebanyak ${Math.round((pollResults.cukup_khawatir / (totalVotes || 1)) * 100)}% warga merasa khawatir. Pengurus perlu mengadakan dialog warga mengenai penataan kebersihan lingkungan atau keamanan ronda malam.`;
      } else if (lower.includes('pekerjaan') || lower.includes('warga') || lower.includes('penduduk')) {
        const jobCounts: Record<string, number> = {};
        let totalMembers = 0;
        households.forEach(h => {
          h.members.forEach(m => {
            totalMembers++;
            const job = m.pekerjaan || 'Tidak Diketahui';
            jobCounts[job] = (jobCounts[job] || 0) + 1;
          });
        });
        const jobList = Object.entries(jobCounts).map(([job, count]) => `  * **${job}:** ${count} warga`).join('\n');
        reply = `**Data Demografi Pekerjaan & Resiko Kemiskinan:**\n` +
                `- Total penduduk terdata di sistem: **${totalMembers} warga**.\n` +
                `- Distribusi Pekerjaan:\n${jobList}\n` +
                `- Estimasi Resiko Kemiskinan: **Sangat Rendah**.\n\n` +
                `*Evaluasi:* Mayoritas warga memiliki pekerjaan produktif di sektor formal dan wirausaha. Program bantuan sosial sebaiknya difokuskan pada peningkatan keahlian bagi warga kategori pelajar/pencari kerja.`;
      } else {
        reply = `**Rangkuman Evaluasi Bulanan Layanan Publik (${activeRtRw}):**\n` +
                `1. **Aduan & Tanggapan:** Respon pengurus terhadap pengaduan berada di atas rata-rata (80% diselesaikan tepat waktu).\n` +
                `2. **Partisipasi Sosial:** Poin keaktifan warga rata-rata mencapai **${poinWarga} poin**, mencerminkan kepedulian warga yang tinggi dalam gotong royong.\n` +
                `3. **Lingkungan & Kesehatan:** Keadaan kondusif dengan survei kenyamanan didominasi penilaian positif.\n\n` +
                `Silakan tanyakan secara spesifik mengenai **"keuangan kas"**, **"aduan warga"**, **"survei lingkungan"**, atau **"pekerjaan penduduk"** untuk mendapatkan visualisasi data yang terperinci.`;
      }

      const aiTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setEvalMessages(prev => [...prev, { sender: 'ai', text: reply, time: aiTime }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvalTyping(false);
    }
  };

  // ======================== ROUTER SWITCH MODUL VIEW ========================
  const renderActiveView = () => {
    switch (currentTab) {
      case 'beranda':
        return (
          <BerandaView
            isAdmin={isAdmin}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onEditAnnouncement={handleEditAnnouncement}
            activeRtRw={activeRtRw}
            totalWarga={totalWarga}
            kasRT={kasRT}
            poinWarga={poinWarga}
            onUpdateStats={handleUpdateStats}
            kasLedger={kasLedger}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            emergencyContacts={emergencyContacts}
            onAddContact={handleAddContact}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            jamSampah={jamSampah}
            jamOperasional={jamOperasional}
            onUpdateSchedules={handleUpdateSchedules}
            pollResults={pollResults}
            userVoted={userVoted}
            onVoteComfort={handleVoteComfort}
          />
        );
      
      case 'konsultasi-ai':
        return (
          <KonsultasiAIView
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
            isTyping={isTyping}
          />
        );

      case 'evaluasi-ai':
        return (
          <EvaluasiAIView
            chatMessages={evalMessages}
            onSendChatMessage={handleSendEvalMessage}
            isTyping={isEvalTyping}
          />
        );

      case 'statistik':
        return (
          <StatistikView
            households={households}
            pollResults={pollResults}
            userVoted={userVoted}
            onVoteComfort={handleVoteComfort}
            aduanList={aduanList}
            poinWarga={poinWarga}
          />
        );
      
      case 'cek-fakta':
      case 'kelola-cek-fakta':
        return (
          <CekFaktaView
            isAdmin={isAdmin}
            verifiedFacts={verifiedFacts}
            submittedRumors={submittedRumors}
            onSubmitRumor={handleSubmitRumor}
            onVerifyRumor={handleVerifyRumor}
            onDeleteRumor={handleDeleteRumor}
            onAddFact={handleAddFact}
            onDeleteFact={handleDeleteFact}
            onEditFact={handleEditFact}
          />
        );
      
      case 'lapor-aduan':
      case 'kelola-aduan':
        return (
          <LaporAduanView
            isAdmin={isAdmin}
            aduanList={aduanList}
            onSubmitAduan={handleSubmitAduan}
            onUpdateAduanStatus={handleUpdateAduanStatus}
            onDeleteAduan={handleDeleteAduan}
          />
        );
      
      case 'pengaturan':
        return (
          <PengaturanView
            isAdmin={isAdmin}
            onToggleRole={handleToggleRole}
            activeRtRw={activeRtRw}
            onRtRwChange={setActiveRtRw}
            households={households}
            onAddFamilyMember={handleAddFamilyMember}
            onDeleteFamilyMember={handleDeleteFamilyMember}
            onEditFamilyMember={handleEditFamilyMember}
            onEditHouseholdKk={handleEditHouseholdKk}
          />
        );
      
      default:
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
            <h3 className="font-bold text-slate-800 text-lg">Modul Tidak Ditemukan</h3>
            <button 
              onClick={() => setCurrentTab('beranda')} 
              className="mt-4 bg-civic-primary text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      isAdmin={isAdmin}
      activeRtRw={activeRtRw}
      onRtRwChange={setActiveRtRw}
    >
      {renderActiveView()}
    </DashboardLayout>
  );
}

export default App;
