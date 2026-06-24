import React from 'react';
import type { Announcement, Aduan, Fact, Rumor, ChatMessage, LedgerTransaction, FamilyMember, Household } from '../types';

export function useCivicData() {
  // ======================== STATE GLOBAL SIMULASI ========================
  // Kredensial Admin Pengurus (Username & Password mutlak, bisa diubah)
  const [adminCredentials, setAdminCredentials] = React.useState(() => {
    const saved = localStorage.getItem('civic_admin_credentials');
    return saved ? JSON.parse(saved) : { username: 'admin', password: '123' };
  });

  // Warga yang telah disetujui (Approved) dan bisa login
  const [approvedUsers, setApprovedUsers] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('civic_approved_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Registrasi pending warga baru yang butuh approval
  const [pendingRegistrations, setPendingRegistrations] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('civic_pending_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  // Sesi Pengguna aktif (null | 'admin' | object warga)
  const [currentUser, setCurrentUser] = React.useState<any>(() => {
    const saved = localStorage.getItem('civic_currentUser');
    if (saved === 'admin') return 'admin';
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Derived state untuk admin check
  const isAdmin = currentUser === 'admin';

  // Smart Quiz Questions (Dapat dikelola oleh admin)
  const [quizQuestions, setQuizQuestions] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('civic_quiz_questions');
    return saved ? JSON.parse(saved) : [];
  });

  // Poin per soal yang benar (Dapat diatur oleh admin)
  const [pointsPerQuestion, setPointsPerQuestion] = React.useState<number>(() => {
    const saved = localStorage.getItem('civic_quiz_points_per_q');
    return saved ? parseInt(saved, 10) : 5;
  });

  // Sync quizQuestions ke localStorage
  React.useEffect(() => {
    localStorage.setItem('civic_quiz_questions', JSON.stringify(quizQuestions));
  }, [quizQuestions]);

  // Sync pointsPerQuestion ke localStorage
  React.useEffect(() => {
    localStorage.setItem('civic_quiz_points_per_q', pointsPerQuestion.toString());
  }, [pointsPerQuestion]);
  
  // Melacak RT/RW aktif dalam simulasi sistem multi-RT/RW
  const [activeRtRw, setActiveRtRw] = React.useState<string>(() => {
    const saved = localStorage.getItem('civic_active_rtrw');
    return saved || 'RT 04 / RW 02';
  });

  React.useEffect(() => {
    localStorage.setItem('civic_active_rtrw', activeRtRw);
  }, [activeRtRw]);

  // Melacak tab aktif saat ini
  const [currentTab, setCurrentTab] = React.useState<string>('beranda');

  // State untuk survey kenyamanan lingkungan mingguan
  type PollResults = {
    sangat_nyaman: number;
    biasa_saja: number;
    cukup_khawatir: number;
  };

  const [pollResults, setPollResults] = React.useState<PollResults>(() => {
    const saved = localStorage.getItem('civic_poll_results');
    return saved ? JSON.parse(saved) as PollResults : { sangat_nyaman: 0, biasa_saja: 0, cukup_khawatir: 0 };
  });

  React.useEffect(() => {
    localStorage.setItem('civic_poll_results', JSON.stringify(pollResults));
  }, [pollResults]);

  const [userVoted, setUserVoted] = React.useState<string | null>(() => {
    return localStorage.getItem('civic_user_voted') || null;
  });

  React.useEffect(() => {
    if (userVoted) {
      localStorage.setItem('civic_user_voted', userVoted);
    } else {
      localStorage.removeItem('civic_user_voted');
    }
  }, [userVoted]);

  // State Obrolan Chatbot Evaluasi AI Admin
  const [evalMessages, setEvalMessages] = React.useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('civic_eval_messages');
    return saved ? JSON.parse(saved) : [
      {
        sender: 'ai',
        text: 'Halo Pak Pengurus RT/RW! Saya Asisten AI Evaluasi Layanan Publik. Saya siap menyajikan data selama sebulan ini dan mengevaluasi kinerja layanan publik di RT 04.',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_eval_messages', JSON.stringify(evalMessages));
  }, [evalMessages]);

  const [isEvalTyping, setIsEvalTyping] = React.useState<boolean>(false);

  // Statistik RT/RW yang disimpan terpusat (dapat diedit oleh admin)
  const [totalWarga, setTotalWarga] = React.useState<number>(() => {
    const saved = localStorage.getItem('civic_total_warga');
    return saved ? parseInt(saved, 10) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem('civic_total_warga', totalWarga.toString());
  }, [totalWarga]);

  const [kasRT, setKasRT] = React.useState<number>(() => {
    const saved = localStorage.getItem('civic_kas_rt');
    return saved ? parseInt(saved, 10) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem('civic_kas_rt', kasRT.toString());
  }, [kasRT]);

  const [poinWarga, setPoinWarga] = React.useState<number>(() => {
    const saved = localStorage.getItem('civic_poin_warga');
    return saved ? parseInt(saved, 10) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem('civic_poin_warga', poinWarga.toString());
  }, [poinWarga]);

  // Sync poinWarga to current citizen points
  React.useEffect(() => {
    if (currentUser && currentUser !== 'admin') {
      const updatedUser = approvedUsers.find(u => u.id === currentUser.id);
      if (updatedUser) {
        setPoinWarga(updatedUser.points !== undefined ? updatedUser.points : 0);
      } else {
        setPoinWarga(currentUser.points !== undefined ? currentUser.points : 0);
      }
    }
  }, [currentUser, approvedUsers]);

  // Jadwal operasional RT/RW (dapat diedit oleh admin)
  const [jamSampah, setJamSampah] = React.useState<string>(() => {
    return localStorage.getItem('civic_jam_sampah') || '08:00 - 10:00 WIB';
  });

  React.useEffect(() => {
    localStorage.setItem('civic_jam_sampah', jamSampah);
  }, [jamSampah]);

  const [jamOperasional, setJamOperasional] = React.useState<string>(() => {
    return localStorage.getItem('civic_jam_operasional') || 'Senin - Jumat, 19:00 - 21:00 WIB';
  });

  React.useEffect(() => {
    localStorage.setItem('civic_jam_operasional', jamOperasional);
  }, [jamOperasional]);

  // State Kontak Darurat RT/RW (dapat di-CRUD oleh admin)
  const [emergencyContacts, setEmergencyContacts] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('civic_emergency_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_emergency_contacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  // 1. State Pengumuman RT/RW
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(() => {
    const saved = localStorage.getItem('civic_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // 2. State Obrolan AI (Konsultasi Warga) - Menggunakan waktu JS real-time dunia nyata
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('civic_chat_messages');
    return saved ? JSON.parse(saved) : [
      {
        sender: 'ai',
        text: 'Halo! Saya Asisten AI RT/RW. Ada yang bisa saya bantu hari ini? Anda bisa menanyakan cara mengurus KTP, jadwal posyandu, syarat pembuatan KK, atau iuran warga.',
        time: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const [isTyping, setIsTyping] = React.useState<boolean>(false);

  // 3. State Cek Fakta (Informasi Resmi vs Isu/Hoaks)
  const [verifiedFacts, setVerifiedFacts] = React.useState<Fact[]>(() => {
    const saved = localStorage.getItem('civic_verified_facts');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_verified_facts', JSON.stringify(verifiedFacts));
  }, [verifiedFacts]);

  const [submittedRumors, setSubmittedRumors] = React.useState<Rumor[]>(() => {
    const saved = localStorage.getItem('civic_submitted_rumors');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_submitted_rumors', JSON.stringify(submittedRumors));
  }, [submittedRumors]);

  // 4. State Aduan Warga
  const [aduanList, setAduanList] = React.useState<Aduan[]>(() => {
    const saved = localStorage.getItem('civic_aduan_list');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_aduan_list', JSON.stringify(aduanList));
  }, [aduanList]);

  // 5. State Transparansi Keuangan (Ledger Keuangan RT)
  const [kasLedger, setKasLedger] = React.useState<LedgerTransaction[]>(() => {
    const saved = localStorage.getItem('civic_kas_ledger');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('civic_kas_ledger', JSON.stringify(kasLedger));
  }, [kasLedger]);

  // 6. State Data Kartu Keluarga Warga & Lingkungan (RT/RW)
  const [households, setHouseholds] = React.useState<Household[]>(() => {
    const saved = localStorage.getItem('civic_households');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync households to localStorage
  React.useEffect(() => {
    localStorage.setItem('civic_households', JSON.stringify(households));
  }, [households]);

  // ======================== HANDLERS (SIAP API BACKEND) ========================

  // A. Kredensial & Autentikasi
  const handleLoginWarga = (email: string, pass: string) => {
    const user = approvedUsers.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('civic_currentUser', JSON.stringify(user));
      return { success: true };
    }

    const isPending = pendingRegistrations.some(u => u.email === email && u.password === pass);
    if (isPending) {
      return { success: false, error: 'Akun Anda masih PENDING. Harap melapor langsung ke Pengurus RT/RW untuk disetujui (approve)!' };
    }

    return { success: false, error: 'Email atau kata sandi warga salah!' };
  };

  const handleLoginAdmin = (username: string, pass: string) => {
    if (username === adminCredentials.username && pass === adminCredentials.password) {
      setCurrentUser('admin');
      localStorage.setItem('civic_currentUser', 'admin');
      return { success: true };
    }
    return { success: false, error: 'Username atau password pengurus salah!' };
  };

  const handleRegisterWarga = (name: string, email: string, nik: string, pass: string) => {
    const emailExists = approvedUsers.some(u => u.email === email) || pendingRegistrations.some(u => u.email === email);
    const nikExists = approvedUsers.some(u => u.nik === nik) || pendingRegistrations.some(u => u.nik === nik);

    if (emailExists) return { success: false, error: 'Email ini sudah terdaftar!' };
    if (nikExists) return { success: false, error: 'NIK ini sudah terdaftar!' };

    const newUser = { id: Date.now().toString(), nama: name, email, nik, password: pass };
    const updated = [...pendingRegistrations, newUser];
    setPendingRegistrations(updated);
    localStorage.setItem('civic_pending_registrations', JSON.stringify(updated));
    return { success: true };
  };

  const handleApproveRegistration = (id: string) => {
    const user = pendingRegistrations.find(u => u.id === id);
    if (!user) return;

    const updatedPending = pendingRegistrations.filter(u => u.id !== id);
    const updatedApproved = [...approvedUsers, user];

    setPendingRegistrations(updatedPending);
    setApprovedUsers(updatedApproved);

    localStorage.setItem('civic_pending_registrations', JSON.stringify(updatedPending));
    localStorage.setItem('civic_approved_users', JSON.stringify(updatedApproved));

    // Tambahkan otomatis ke households jika NIK belum terdaftar
    const nikExists = households.some(h => h.members.some(m => m.nik === user.nik));
    if (!nikExists) {
      const newHousehold: Household = {
        id: Date.now(),
        kepalaKeluarga: user.nama,
        noKk: user.nik,
        alamat: 'Jl. Mawar Indah RT 04 No. ' + Math.floor(Math.random() * 50 + 1),
        noHp: '0812-' + Math.floor(Math.random() * 9000 + 1000) + '-' + Math.floor(Math.random() * 9000 + 1000),
        members: [
          {
            id: Date.now() + 1,
            nama: user.nama,
            nik: user.nik,
            tglLahir: '1995-01-01',
            pekerjaan: 'Pekerja Mandiri',
            hubungan: 'Kepala Keluarga',
            statusKawin: 'Belum Kawin',
            pendidikan: 'SMA/SMK'
          }
        ]
      };
      setHouseholds(prev => [...prev, newHousehold]);
    }
  };

  const handleRejectRegistration = (id: string) => {
    const updatedPending = pendingRegistrations.filter(u => u.id !== id);
    setPendingRegistrations(updatedPending);
    localStorage.setItem('civic_pending_registrations', JSON.stringify(updatedPending));
  };

  const handleUpdateCitizenPoints = (userId: string, points: number) => {
    setApprovedUsers(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, points } : u);
      localStorage.setItem('civic_approved_users', JSON.stringify(updated));
      return updated;
    });
    // If the updated user is the current user, update currentUser session
    if (currentUser && currentUser !== 'admin' && currentUser.id === userId) {
      const updatedUser = { ...currentUser, points };
      setCurrentUser(updatedUser);
      localStorage.setItem('civic_currentUser', JSON.stringify(updatedUser));
      setPoinWarga(points);
    }
  };

  const handleAddQuizQuestion = (question: string, options: Array<{ key: string; text: string }>, correctAnswer: string) => {
    const newQuestion = {
      id: Date.now(),
      question,
      options,
      correctAnswer
    };
    setQuizQuestions(prev => [...prev, newQuestion]);
  };

  const handleDeleteQuizQuestion = (id: number) => {
    setQuizQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleUpdatePointsPerQuestion = (points: number) => {
    setPointsPerQuestion(points);
  };

  const handleUpdateAdminCredentials = (username: string, pass: string) => {
    const creds = { username, password: pass };
    setAdminCredentials(creds);
    localStorage.setItem('civic_admin_credentials', JSON.stringify(creds));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civic_currentUser');
    setCurrentTab('beranda');
  };

  const handleToggleRole = (admin: boolean) => {
    if (admin) {
      setCurrentUser('admin');
      localStorage.setItem('civic_currentUser', 'admin');
    } else {
      handleLogout();
    }
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
      wargaNama: 'Warga Teladan RT 04',
      konten,
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

  // V. Hapus Akun Warga
  const handleDeleteCitizen = (userId: string) => {
    const updatedApproved = approvedUsers.filter(u => u.id !== userId);
    setApprovedUsers(updatedApproved);
    localStorage.setItem('civic_approved_users', JSON.stringify(updatedApproved));
  };

  // W. Tambah Kartu Keluarga Baru
  const handleAddHousehold = (kepalaKeluarga: string, noKk: string, alamat: string, noHp: string) => {
    const newHousehold: Household = {
      id: Date.now(),
      kepalaKeluarga,
      noKk,
      alamat,
      noHp,
      members: [
        {
          id: Date.now() + 1,
          nama: kepalaKeluarga,
          nik: noKk,
          tglLahir: '',
          pekerjaan: '',
          hubungan: 'Kepala Keluarga',
          statusKawin: 'Belum Kawin',
          pendidikan: 'SMA/SMK'
        }
      ]
    };
    const updated = [...households, newHousehold];
    setHouseholds(updated);
    localStorage.setItem('civic_households', JSON.stringify(updated));
  };

  // X. Hapus Kartu Keluarga
  const handleDeleteHousehold = (id: number) => {
    const updated = households.filter(h => h.id !== id);
    setHouseholds(updated);
    localStorage.setItem('civic_households', JSON.stringify(updated));
  };

  // Y. Netralisasikan Seluruh Data Portal (Reset All Data)
  const handleResetAllData = () => {
    setApprovedUsers([]);
    setPendingRegistrations([]);
    setQuizQuestions([]);
    setPollResults({ sangat_nyaman: 0, biasa_saja: 0, cukup_khawatir: 0 });
    setUserVoted(null);
    setEmergencyContacts([]);
    setAnnouncements([]);
    setVerifiedFacts([]);
    setSubmittedRumors([]);
    setAduanList([]);
    setKasLedger([]);
    setHouseholds([]);
    
    setTotalWarga(0);
    setKasRT(0);
    setPoinWarga(0);

    localStorage.removeItem('civic_approved_users');
    localStorage.removeItem('civic_pending_registrations');
    localStorage.removeItem('civic_quiz_questions');
    localStorage.removeItem('civic_households');
    localStorage.removeItem('civic_quiz_points_per_q');
    localStorage.removeItem('civic_poll_results');
    localStorage.removeItem('civic_user_voted');
    localStorage.removeItem('civic_emergency_contacts');
    localStorage.removeItem('civic_announcements');
    localStorage.removeItem('civic_verified_facts');
    localStorage.removeItem('civic_submitted_rumors');
    localStorage.removeItem('civic_aduan_list');
    localStorage.removeItem('civic_kas_ledger');
    localStorage.removeItem('civic_active_rtrw');
    localStorage.removeItem('civic_eval_messages');
    localStorage.removeItem('civic_chat_messages');
    
    alert('Seluruh data portal berhasil dinetralisasikan ke 0!');
    handleLogout();
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
        reply = `Analisis Layanan Publik (Aduan Warga):\n` +
                `- Total aduan masuk bulan ini: ${total} laporan.\n` +
                `- Status penyelesaian:\n` +
                `  - ${selesai} aduan telah diselesaikan dengan sukses.\n` +
                `  - ${diproses} aduan sedang aktif ditindaklanjuti.\n` +
                `  - ${terkirim} aduan baru masuk dan perlu segera ditanggapi.\n\n` +
                `Rekomendasi: Segera tinjau laporan yang baru masuk agar tingkat respons layanan tetap optimal.`;
      } else if (lower.includes('keuangan') || lower.includes('kas') || lower.includes('transparansi')) {
        const totalPemasukan = kasLedger.filter(k => k.jenis === 'pemasukan').reduce((sum, item) => sum + item.jumlah, 0);
        const totalPengeluaran = kasLedger.filter(k => k.jenis === 'pengeluaran').reduce((sum, item) => sum + item.jumlah, 0);
        reply = `Evaluasi Keuangan Kas RT (${activeRtRw}):\n` +
                `- Saldo Kas saat ini: Rp ${kasRT.toLocaleString('id-ID')}.\n` +
                `- Akumulasi bulan ini:\n` +
                `  - Total Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}\n` +
                `  - Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n` +
                `- Rincian transaksi terakhir: ${kasLedger[kasLedger.length - 1]?.keterangan || 'N/A'}.\n\n` +
                `Evaluasi: Aliran kas berjalan sehat dan transparan. Neraca menunjukkan surplus yang memadai untuk penanganan darurat lingkungan.`;
      } else if (lower.includes('survei') || lower.includes('lingkungan') || lower.includes('nyaman') || lower.includes('kesehatan')) {
        const totalVotes = pollResults.sangat_nyaman + pollResults.biasa_saja + pollResults.cukup_khawatir;
        reply = `Analisis Survei Kenyamanan Lingkungan Warga:\n` +
                `- Total warga berpartisipasi: ${totalVotes} orang.\n` +
                `- Sebaran respon:\n` +
                `  - Sangat Nyaman: ${pollResults.sangat_nyaman} warga\n` +
                `  - Biasa Saja: ${pollResults.biasa_saja} warga\n` +
                `  - Cukup Khawatir: ${pollResults.cukup_khawatir} warga\n\n` +
                `Analisis Kesehatan Lingkungan: Mayoritas warga merasa aman dan nyaman. Namun, sebanyak ${Math.round((pollResults.cukup_khawatir / (totalVotes || 1)) * 100)}% warga merasa khawatir. Pengurus perlu mengadakan dialog warga mengenai penataan kebersihan lingkungan atau keamanan ronda malam.`;
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
        const jobList = Object.entries(jobCounts).map(([job, count]) => `  - ${job}: ${count} warga`).join('\n');
        reply = `Data Demografi Pekerjaan dan Resiko Kemiskinan:\n` +
                `- Total penduduk terdata di sistem: ${totalMembers} warga.\n` +
                `- Distribusi Pekerjaan:\n${jobList}\n` +
                `- Estimasi Resiko Kemiskinan: Sangat Rendah.\n\n` +
                `Evaluasi: Mayoritas warga memiliki pekerjaan produktif di sektor formal dan wirausaha. Program bantuan sosial sebaiknya difokuskan pada peningkatan keahlian bagi warga kategori pelajar/pencari kerja.`;
      } else {
        reply = `Rangkuman Evaluasi Bulanan Layanan Publik (${activeRtRw}):\n` +
                `1. Aduan dan Tanggapan: Respon pengurus terhadap pengaduan berada di atas rata-rata (80% diselesaikan tepat waktu).\n` +
                `2. Partisipasi Sosial: Poin keaktifan warga rata-rata mencapai ${poinWarga} poin, mencerminkan kepedulian warga yang tinggi dalam gotong royong.\n` +
                `3. Lingkungan dan Kesehatan: Keadaan kondusif dengan survei kenyamanan didominasi penilaian positif.\n\n` +
                `Silakan tanyakan secara spesifik mengenai "keuangan kas", "aduan warga", "survei lingkungan", atau "pekerjaan penduduk" untuk mendapatkan visualisasi data yang terperinci.`;
      }

      const aiTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setEvalMessages(prev => [...prev, { sender: 'ai', text: reply, time: aiTime }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvalTyping(false);
    }
  };

  return {
    adminCredentials,
    approvedUsers,
    pendingRegistrations,
    currentUser,
    isAdmin,
    quizQuestions,
    pointsPerQuestion,
    activeRtRw,
    setActiveRtRw,
    currentTab,
    setCurrentTab,
    pollResults,
    userVoted,
    evalMessages,
    isEvalTyping,
    totalWarga,
    kasRT,
    poinWarga,
    jamSampah,
    jamOperasional,
    emergencyContacts,
    announcements,
    chatMessages,
    isTyping,
    verifiedFacts,
    submittedRumors,
    aduanList,
    kasLedger,
    households,
    handleLoginWarga,
    handleLoginAdmin,
    handleRegisterWarga,
    handleApproveRegistration,
    handleRejectRegistration,
    handleUpdateCitizenPoints,
    handleAddQuizQuestion,
    handleDeleteQuizQuestion,
    handleUpdatePointsPerQuestion,
    handleUpdateAdminCredentials,
    handleLogout,
    handleToggleRole,
    handleUpdateStats,
    handleUpdateSchedules,
    handleAddAnnouncement,
    handleDeleteAnnouncement,
    handleSendChatMessage,
    handleSubmitRumor,
    handleVerifyRumor,
    handleDeleteRumor,
    handleAddFact,
    handleDeleteFact,
    handleSendEvalMessage,
    handleSubmitAduan,
    handleUpdateAduanStatus,
    handleDeleteAduan,
    handleAddFamilyMember,
    handleDeleteFamilyMember,
    handleEditAnnouncement,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    handleAddTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    handleEditFact,
    handleEditFamilyMember,
    handleEditHouseholdKk,
    handleVoteComfort,
    handleDeleteCitizen,
    handleAddHousehold,
    handleDeleteHousehold,
    handleResetAllData,
  };
}
