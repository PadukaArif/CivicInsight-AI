import React from 'react';
import type { Announcement, Aduan, Fact, Rumor, ChatMessage, LedgerTransaction, FamilyMember, Household } from '../types';

const BASE_URL = process.env.VITE_API_URL || 'https://civicinsight-ai-backend.up.railway.app';

export function useCivicData() {
  // ======================== STATE GLOBAL SIMULASI ========================
  // Kredensial Admin Pengurus (Username & Password mutlak, bisa diubah)
  const [adminCredentials, setAdminCredentials] = React.useState(() => {
    const saved = localStorage.getItem('civic_admin_credentials');
    return saved ? JSON.parse(saved) : { username: 'admin', password: '123' };
  });

  // Warga yang telah disetujui (Approved) dan bisa login
  const [approvedUsers, setApprovedUsers] = React.useState<any[]>([]);

  // Registrasi pending warga baru yang butuh approval
  const [pendingRegistrations, setPendingRegistrations] = React.useState<any[]>([]);

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
  const [quizQuestions, setQuizQuestions] = React.useState<any[]>([]);

  // Poin per soal yang benar (Dapat diatur oleh admin)
  const [pointsPerQuestion, setPointsPerQuestion] = React.useState<number>(() => {
    const saved = localStorage.getItem('civic_quiz_points_per_q');
    return saved ? parseInt(saved, 10) : 5;
  });

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

  const [pollResults, setPollResults] = React.useState<PollResults>({ sangat_nyaman: 0, biasa_saja: 0, cukup_khawatir: 0 });
  const [userVoted, setUserVoted] = React.useState<string | null>(null);

  // State Obrolan Chatbot Evaluasi AI Admin
  const [evalMessages, setEvalMessages] = React.useState<ChatMessage[]>(() => {
    const userSuffix = (() => {
      const saved = localStorage.getItem('civic_currentUser');
      if (saved === 'admin') return 'admin';
      try {
        if (saved) {
          const u = JSON.parse(saved);
          return String(u.id || u.email);
        }
      } catch {}
      return 'guest';
    })();
    const saved = localStorage.getItem(`civic_eval_messages_${userSuffix}`);
    return saved ? JSON.parse(saved) : [
      {
        sender: 'ai',
        text: 'Halo Pak Pengurus RT/RW! Saya Asisten AI Evaluasi Layanan Publik. Saya siap menyajikan data selama sebulan ini dan mengevaluasi kinerja layanan publik di RT 04.',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const lastLoadedUserRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const userSuffix = currentUser === 'admin' 
      ? 'admin' 
      : (currentUser ? String(currentUser.id || currentUser.email) : 'guest');
    
    if (lastLoadedUserRef.current === userSuffix) {
      localStorage.setItem(`civic_eval_messages_${userSuffix}`, JSON.stringify(evalMessages));
    }
  }, [evalMessages, currentUser]);

  const [isEvalTyping, setIsEvalTyping] = React.useState<boolean>(false);

  // Statistik RT/RW yang disimpan terpusat (dapat diedit oleh admin)
  const [totalWarga, setTotalWarga] = React.useState<number>(0);
  const [kasRT, setKasRT] = React.useState<number>(0);
  const [poinWarga, setPoinWarga] = React.useState<number>(0);

  // Sync poinWarga to current citizen points
  React.useEffect(() => {
    if (currentUser && currentUser !== 'admin') {
      const updatedUser = approvedUsers.find(u => String(u.id) === String(currentUser.id));
      if (updatedUser) {
        setPoinWarga(updatedUser.points !== undefined ? updatedUser.points : 0);
      } else {
        setPoinWarga(currentUser.points !== undefined ? currentUser.points : 0);
      }
    } else if (currentUser === 'admin') {
      if (approvedUsers.length > 0) {
        const total = approvedUsers.reduce((sum, u) => sum + (u.points ?? 0), 0);
        const avg = Math.round(total / approvedUsers.length);
        setPoinWarga(avg);
      } else {
        setPoinWarga(0);
      }
    } else {
      setPoinWarga(0);
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
  const [emergencyContacts, setEmergencyContacts] = React.useState<any[]>([]);

  // 1. State Pengumuman RT/RW
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);

  // 2. State Obrolan AI (Konsultasi Warga) - Menggunakan waktu JS real-time dunia nyata
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>(() => {
    const userSuffix = (() => {
      const saved = localStorage.getItem('civic_currentUser');
      if (saved === 'admin') return 'admin';
      try {
        if (saved) {
          const u = JSON.parse(saved);
          return String(u.id || u.email);
        }
      } catch {}
      return 'guest';
    })();
    const saved = localStorage.getItem(`civic_chat_messages_${userSuffix}`);
    return saved ? JSON.parse(saved) : [
      {
        sender: 'ai',
        text: 'Halo! Saya Asisten AI RT/RW. Ada yang bisa saya bantu hari ini? Anda bisa menanyakan cara mengurus KTP, jadwal posyandu, syarat pembuatan KK, atau iuran warga.',
        time: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  React.useEffect(() => {
    const userSuffix = currentUser === 'admin' 
      ? 'admin' 
      : (currentUser ? String(currentUser.id || currentUser.email) : 'guest');
    
    if (lastLoadedUserRef.current === userSuffix) {
      localStorage.setItem(`civic_chat_messages_${userSuffix}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, currentUser]);

  React.useEffect(() => {
    const userSuffix = currentUser === 'admin' 
      ? 'admin' 
      : (currentUser ? String(currentUser.id || currentUser.email) : 'guest');
    
    lastLoadedUserRef.current = userSuffix;

    const savedChat = localStorage.getItem(`civic_chat_messages_${userSuffix}`);
    if (savedChat) {
      setChatMessages(JSON.parse(savedChat));
    } else {
      setChatMessages([
        {
          sender: 'ai',
          text: 'Halo! Saya Asisten AI RT/RW. Ada yang bisa saya bantu hari ini? Anda bisa menanyakan cara mengurus KTP, jadwal posyandu, syarat pembuatan KK, atau iuran warga.',
          time: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }

    const savedEval = localStorage.getItem(`civic_eval_messages_${userSuffix}`);
    if (savedEval) {
      setEvalMessages(JSON.parse(savedEval));
    } else {
      setEvalMessages([
        {
          sender: 'ai',
          text: 'Halo Pak Pengurus RT/RW! Saya Asisten AI Evaluasi Layanan Publik. Saya siap menyajikan data selama sebulan ini dan mengevaluasi kinerja layanan publik di RT 04.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [currentUser]);

  const [isTyping, setIsTyping] = React.useState<boolean>(false);

  // 3. State Cek Fakta (Informasi Resmi vs Isu/Hoaks)
  const [verifiedFacts, setVerifiedFacts] = React.useState<Fact[]>([]);
  const [submittedRumors, setSubmittedRumors] = React.useState<Rumor[]>([]);

  // 4. State Aduan Warga
  const [aduanList, setAduanList] = React.useState<Aduan[]>([]);

  // 5. State Transparansi Keuangan (Ledger Keuangan RT)
  const [kasLedger, setKasLedger] = React.useState<LedgerTransaction[]>([]);

  // 6. State Data Kartu Keluarga Warga & Lingkungan (RT/RW)
  const [households, setHouseholds] = React.useState<Household[]>([]);

  // ======================== API INTEGRATION HELPERS ========================
  const refreshAllData = async () => {
    try {
      const [
        approvedRes,
        pendingRes,
        annRes,
        factsRes,
        rumorsRes,
        aduanRes,
        kasRes,
        hhRes,
        quizRes,
        contactsRes,
        pollRes
      ] = await Promise.all([
        fetch(`${BASE_URL}/auth/approved`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/auth/pending`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/announcements`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/facts`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/rumors`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/aduan`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/kas`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/households`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/quiz/questions`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/contacts`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${BASE_URL}/poll`).then(r => r.json()).catch(() => ({ success: false }))
      ]);

      let approvedList: any[] = [];
      if (approvedRes.success) {
        approvedList = approvedRes.data || [];
        setApprovedUsers(approvedList);
      }

      if (pendingRes.success) {
        setPendingRegistrations(pendingRes.data || []);
      }

      if (annRes.success) {
        setAnnouncements((annRes.data || []).map((ann: any) => ({
          id: ann.id,
          kategori: ann.category,
          judul: ann.title,
          konten: ann.content,
          tanggal: new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          urgensi: ann.urgency
        })));
      }

      if (factsRes.success) {
        setVerifiedFacts((factsRes.data || []).map((f: any) => ({
          id: f.id,
          judul: f.judul,
          penjelasan: f.penjelasan,
          status: f.status,
          sumber: f.sumber || undefined,
          tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        })));
      }

      if (rumorsRes.success) {
        const filteredRumors = (rumorsRes.data || [])
          .filter((r: any) => r.status === 'Belum Diverifikasi')
          .map((r: any) => ({
            id: r.id,
            konten: r.deskripsi,
            wargaNama: r.reporterName || 'Warga Teladan RT 04',
            tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            status: 'belum_verifikasi'
          }));
        setSubmittedRumors(filteredRumors);
      }

      if (aduanRes.success) {
        setAduanList((aduanRes.data || []).map((ad: any) => ({
          id: ad.id,
          wargaId: ad.accountId,
          account_id: ad.accountId,
          wargaNama: ad.reporterName || 'Warga Teladan RT 04',
          kategori: ad.kategori,
          deskripsi: ad.deskripsi,
          lokasi: ad.lokasi,
          status: ad.status,
          tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          tanggapanAdmin: ad.tanggapan || undefined,
          tanggalTanggapan: ad.tanggapan ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined
        })));
      }

      if (kasRes.success) {
        const ledger = kasRes.data || [];
        setKasLedger(ledger);
        const total = ledger.reduce((sum: number, tx: any) => {
          return tx.jenis === 'pemasukan' ? sum + tx.jumlah : sum - tx.jumlah;
        }, 0);
        setKasRT(total);
      }

      let hhList: any[] = [];
      if (hhRes.success) {
        hhList = (hhRes.data || []).map((h: any) => ({
          id: h.id,
          kepalaKeluarga: h.kepalaKeluarga,
          noKk: h.kkNo,
          alamat: h.alamat,
          noHp: h.phoneNumber || '',
          members: (h.members || []).map((m: any) => ({
            id: m.id,
            nama: m.nama,
            nik: m.nik,
            tglLahir: m.tglLahir || '1995-01-01',
            pekerjaan: m.pekerjaan,
            hubungan: m.hubungan,
            statusKawin: m.statusKawin,
            pendidikan: m.pendidikan
          }))
        }));
        setHouseholds(hhList);
      }

      if (quizRes.success) {
        setQuizQuestions(quizRes.data || []);
      }

      if (contactsRes.success) {
        setEmergencyContacts(contactsRes.data || []);
      }

      if (pollRes.success) {
        setPollResults(pollRes.data || { sangat_nyaman: 0, biasa_saja: 0, cukup_khawatir: 0 });
      }

      const totalHhMembers = hhList.reduce((sum: number, h: any) => sum + (h.members ? h.members.length : 0), 0);
      setTotalWarga(Math.max(approvedList.length, totalHhMembers));

    } catch (e) {
      console.error("Error refreshing data from server", e);
    }
  };

  const fetchUserVoted = async (userId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/poll/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserVoted(data.choice);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    refreshAllData();
  }, []);

  React.useEffect(() => {
    if (currentUser && currentUser !== 'admin') {
      fetchUserVoted(currentUser.id);
    } else {
      setUserVoted(null);
    }
  }, [currentUser]);

  // ======================== HANDLERS (SIAP API BACKEND) ========================

  // A. Kredensial & Autentikasi
  const handleLoginWarga = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        const user = data.data; // contains id, email, fullName, role, rt, rw, phoneNumber, isLansia, status, points
        setCurrentUser(user);
        localStorage.setItem('civic_currentUser', JSON.stringify(user));
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (e: any) {
      return { success: false, error: 'Koneksi ke backend server gagal!' };
    }
  };

  const handleLoginAdmin = (username: string, pass: string) => {
    if (username === adminCredentials.username && pass === adminCredentials.password) {
      setCurrentUser('admin');
      localStorage.setItem('civic_currentUser', 'admin');
      return { success: true };
    }
    return { success: false, error: 'Username atau password pengurus salah!' };
  };

  const handleRegisterWarga = async (name: string, email: string, nik: string, pass: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email,
          nik,
          password: pass,
          role: 'warga',
          rt: '04',
          rw: '02',
          isLansia: 0
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (e: any) {
      return { success: false, error: 'Koneksi ke backend server gagal!' };
    }
  };

  const handleApproveRegistration = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/approve/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const user = pendingRegistrations.find(u => String(u.id) === String(id));
        if (user) {
          const nikExists = households.some(h => (h.members || []).some(m => m.nik === user.nik));
          if (!nikExists) {
            const hhRes = await fetch(`${BASE_URL}/households`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                kkNo: user.nik,
                kepalaKeluarga: user.fullName || user.nama,
                alamat: 'Jl. Mawar Indah RT 04 No. ' + Math.floor(Math.random() * 50 + 1),
                phoneNumber: '0812-' + Math.floor(Math.random() * 9000 + 1000)
              })
            });
            const hhData = await hhRes.json();
            if (hhData.success) {
              const hhId = hhData.data.id;
              await fetch(`${BASE_URL}/households/${hhId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  nama: user.fullName || user.nama,
                  nik: user.nik,
                  pekerjaan: 'Pekerja Mandiri',
                  hubungan: 'Kepala Keluarga',
                  statusKawin: 'Belum Kawin',
                  pendidikan: 'SMA/SMK'
                })
              });
            }
          }
        }
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectRegistration = async (id: string) => {
    try {
      await fetch(`${BASE_URL}/auth/reject/${id}`, { method: 'POST' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCitizenPoints = async (userId: string, points: number) => {
    try {
      await fetch(`${BASE_URL}/auth/profile/${userId}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
      });
      await refreshAllData();
      
      // Update currentUser session if matches
      if (currentUser && currentUser !== 'admin' && String(currentUser.id) === String(userId)) {
        const updatedUser = { ...currentUser, points };
        setCurrentUser(updatedUser);
        localStorage.setItem('civic_currentUser', JSON.stringify(updatedUser));
        setPoinWarga(points);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddQuizQuestion = async (question: string, options: Array<{ key: string; text: string }>, correctAnswer: string) => {
    try {
      await fetch(`${BASE_URL}/quiz/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options, correctAnswer })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuizQuestion = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/quiz/questions/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
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
  const handleAddAnnouncement = async (
    judul: string,
    konten: string,
    kategori: 'Penting' | 'Umum' | 'Kegiatan',
    urgensi: 'high' | 'normal'
  ) => {
    try {
      await fetch(`${BASE_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: judul, content: konten, category: kategori, urgency: urgensi })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // D. Menghapus Pengumuman (Admin Only)
  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/announcements/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // E. Mengirim Pertanyaan Ke Asisten AI (Warga) - Jam Real-Time
  const handleSendChatMessage = async (text: string) => {
    const userTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text, time: userTime }]);
    setIsTyping(true);

    let aiReply = '';
    try {
      const contextData = {
        namaWarga: currentUser?.nama || "Warga",
        rtRw: activeRtRw,
        poinKeaktifan: currentUser?.points || 0,
        jumlahKasRT: kasRT,
        aduanWarga: aduanList.filter(a => String(a.wargaId) === String(currentUser?.id) || String(a.account_id) === String(currentUser?.id))
      };
      
      const konsultasiSystemPrompt = `Anda adalah Asisten AI Konsultasi Warga RT/RW di CivicInsight AI. Tugas Anda KHUSUS membantu warga menjawab pertanyaan seputar:
- Administrasi: KTP, KK, surat pengantar RT/RW, SKCK
- Jadwal layanan: posyandu, imunisasi, kerja bakti, ronda malam
- Keuangan warga: kas RT, iuran bulanan, pemasukan/pengeluaran
- Status aduan warga: laporan infrastruktur, kebersihan
- Bantuan sosial: status bansos/DTKS warga
- Info RT/RW: jadwal kegiatan, pengangkutan sampah, keamanan lingkungan

Informasi Konteks Warga Saat Ini:
- Nama: ${contextData.namaWarga}
- RT/RW: ${contextData.rtRw}
- Poin Keaktifan Warga: ${contextData.poinKeaktifan} Poin
- Saldo Kas RT: Rp ${contextData.jumlahKasRT.toLocaleString('id-ID')}
- Daftar Aduan Anda: ${JSON.stringify(contextData.aduanWarga)}

PENTING:
- Jawab SELALU dalam Bahasa Indonesia, ramah, sopan, singkat, padat, dan solutif
- Format dengan Markdown (**tebal** untuk penekanan)
- Jika ditanya tentang berita nasional, isu sosial, atau kesehatan umum, arahkan warga ke menu "Cek Fakta & Isu" di navigasi atas
- Fokus HANYA pada urusan administrasi dan pelayanan RT/RW`;

      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          provider: 'gemini',
          systemPrompt: konsultasiSystemPrompt
        })
      });
      const data = await res.json();
      if (data.success && data.reply && !data.reply.includes("dummy-gemini-key-placeholder")) {
        aiReply = data.reply;
      }
    } catch (e) {
      console.warn("Backend AI chat failed, using offline fallback:", e);
    }

    if (!aiReply) {
      const lower = text.toLowerCase();
      if (lower.includes('ktp') || lower.includes('identitas')) {
        aiReply = `Untuk mengurus KTP baru, rusak, atau hilang di wilayah ${activeRtRw}, silakan siapkan berkas:\n1. Fotokopi Kartu Keluarga (KK)\n2. Surat Pengantar RT/RW (bisa diajukan lewat menu Lapor Aduan)\n3. Dokumen KTP lama (jika rusak) atau Surat Kehilangan Kepolisian (jika hilang).\nBerkas tersebut dapat diserahkan ke Kantor Kelurahan pada hari kerja.`;
      } else if (lower.includes('posyandu') || lower.includes('imunisasi')) {
        aiReply = `Jadwal pelayanan Posyandu Balita & Lansia di ${activeRtRw} diadakan rutin setiap hari Sabtu minggu kedua tiap bulannya di Balai Warga. Pelayanan dimulai pukul 08:00 s.d 11:00 WIB.`;
      } else if (lower.includes('kas') || lower.includes('iuran') || lower.includes('bayar') || lower.includes('keuangan')) {
        const totalPemasukan = kasLedger.filter(k => k.jenis === 'pemasukan').reduce((sum, item) => sum + item.jumlah, 0);
        const totalPengeluaran = kasLedger.filter(k => k.jenis === 'pengeluaran').reduce((sum, item) => sum + item.jumlah, 0);
        aiReply = `💰 **[KAS & IURAN WARGA]**\nBerikut rincian kas warga ${activeRtRw} saat ini:\n- **Saldo Kas Saat Ini**: Rp ${kasRT.toLocaleString('id-ID')}\n- **Pemasukan Bulan Ini**: Rp ${totalPemasukan.toLocaleString('id-ID')}\n- **Pengeluaran Bulan Ini**: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n- **Transaksi Terakhir**: "${kasLedger[kasLedger.length - 1]?.keterangan || 'Tidak ada iuran masuk'}"\n\n*Catatan: Pembayaran iuran bulanan warga wajib sebesar Rp 50.000, disetor tunai ke Ibu Retno atau ditransfer.*`;
      } else if (lower.includes('aduan') || lower.includes('laporan')) {
        const myAduan = aduanList.filter(a => String(a.wargaId) === String(currentUser?.id) || String(a.account_id) === String(currentUser?.id));
        if (myAduan.length > 0) {
          aiReply = `📝 **[STATUS ADUAN ANDA]**\nAnda telah melaporkan **${myAduan.length}** aduan aktif di portal warga:\n\n` +
            myAduan.map(a => `- **[${a.kategori}]** di ${a.lokasi}\n  Deskripsi: "${a.deskripsi}"\n  Status: **${a.status}**${a.tanggapan ? `\n  Tanggapan RT: "${a.tanggapan}"` : ''}`).join('\n\n');
        } else {
          aiReply = `📝 **[STATUS ADUAN ANDA]**\nAnda belum memiliki laporan aduan aktif saat ini. Jika menemukan jalan rusak, lampu padam, atau masalah lingkungan, silakan ajukan di menu **Lapor Aduan**.`;
        }
      } else if (lower.includes('bansos') || lower.includes('dtks') || lower.includes('bpnt') || lower.includes('pkh')) {
        try {
          const res = await fetch(`${BASE_URL}/news/bansos`);
          const data = await res.json();
          const userBansos = data.find((item: any) => item.nama.toLowerCase().includes(currentUser?.nama?.toLowerCase()) || currentUser?.nama?.toLowerCase().includes(item.nama.toLowerCase()));
          if (userBansos) {
            aiReply = `💰 **[CEK STATUS BANSOS ANDA]**\nSelamat, NIK Anda terdaftar dalam program bantuan sosial Pemerintah:\n\n` +
              `- **Nama**: ${userBansos.nama}\n- **NIK**: ${userBansos.nik}\n- **Wilayah**: ${userBansos.wilayah}\n- **BPNT**: **${userBansos.bpnt}**\n- **PKH**: **${userBansos.pkh}**\n- **PBI-JK**: **${userBansos.pbi_jk}**`;
          } else {
            aiReply = `💰 **[CEK STATUS BANSOS ANDA]**\nNama Anda (**${currentUser?.nama}**) tidak terdaftar dalam penerima Bansos aktif di database saat ini.\n\n*Silakan hubungi Seksi Kesejahteraan Rakyat RT jika Anda merasa berhak terdaftar di DTKS.*`;
          }
        } catch (e) {
          aiReply = `💰 **[STATUS BANSOS]**\nBantuan sosial dikelola oleh Seksi Kesejahteraan Rakyat. Warga yang berhak menerima harus terdaftar dalam Data Terpadu Kesejahteraan Sosial (DTKS).`;
        }
      } else if (lower.includes('poin') || lower.includes('kuis') || lower.includes('point')) {
        aiReply = `🎮 **[STATUS POIN KEAKTIFAN]**\nStatus poin Anda saat ini:\n- **Nama**: ${currentUser?.nama}\n- **Poin Warga**: **${currentUser?.points || 0} Poin**\n\n*Tingkatkan poin Anda dengan menjawab kuis cerdas warga secara rutin di halaman utama dashboard!*`;
      } else if (lower.includes('kk') || lower.includes('keluarga')) {
        aiReply = `Pembuatan Kartu Keluarga (KK) baru atau perubahan data (pecah KK) di wilayah ${activeRtRw} membutuhkan:\n1. Surat Pengantar RT/RW\n2. KK asli lama\n3. Buku Nikah / Akta Nikah (jika pengantin baru)\n4. Surat keterangan pindah (jika berasal dari luar kota).\nBawa seluruh dokumen ke loket kelurahan setempat.`;
      } else if (lower.includes('ronda') || lower.includes('keamanan')) {
        aiReply = `Jadwal ronda malam warga diadakan setiap hari mulai pukul 22:00 WIB untuk menjaga keamanan lingkungan. Silakan hubungi seksi keamanan RT jika ingin menanyakan pembagian regu ronda Anda.`;
      } else if (lower.includes('kerja bakti') || lower.includes('gotong royong') || lower.includes('bersih')) {
        aiReply = `Kerja bakti warga diadakan rutin pada hari Minggu pertama setiap bulannya pukul 07:00 WIB untuk menjaga kebersihan saluran air, selokan, dan lingkungan sekitar.`;
      } else if (lower.includes('sampah') || lower.includes('angkut')) {
        aiReply = `Pengangkutan sampah warga dilakukan setiap hari Senin, Rabu, dan Jumat mulai pukul 08:00 WIB. Harap taruh tempat sampah di depan pagar rumah masing-masing.`;
      } else if (lower.includes('surat') || lower.includes('pengantar') || lower.includes('rt') || lower.includes('rw')) {
        aiReply = `Untuk membuat Surat Pengantar RT/RW (misalnya untuk urusan KTP, KK, SKCK, atau surat pindah), Anda dapat mengajukannya langsung ke ketua RT atau RW pada jam operasional kerja.`;
      } else if (['halo', 'hai', 'pagi', 'siang', 'sore'].some(g => lower.includes(g)) || (lower.includes('malam') && lower.length < 25)) {
        aiReply = `Halo! Saya Asisten AI RT/RW. Ada yang bisa saya bantu hari ini? Anda bisa menanyakan syarat KTP/KK, jadwal posyandu, iuran warga, laporan aduan Anda, poin keaktifan, jadwal ronda, atau kerja bakti.`;
      } else {
        aiReply = 'Maaf, saya tidak menemukan informasi spesifik mengenai hal tersebut di database RT/RW setempat. Silakan ajukan aduan resmi ke pengurus RT melalui menu Lapor Aduan, atau gunakan menu **Cek Fakta & Isu** untuk pertanyaan berita dan kesehatan.';
      }
    }

    const aiTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply, time: aiTime }]);
    setIsTyping(false);
  };

  // F. Melaporkan Rumor Isu Baru (Warga)
  const handleSubmitRumor = async (konten: string) => {
    try {
      await fetch(`${BASE_URL}/rumors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUser?.id || 1,
          judul: konten.substring(0, 50),
          deskripsi: konten
        })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // G. Memverifikasi Rumor Aduan Warga (Admin Only)
  const handleVerifyRumor = async (id: number, status: 'fakta' | 'hoaks', penjelasan: string) => {
    try {
      await fetch(`${BASE_URL}/rumors/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: `Klarifikasi Isu`,
          penjelasan,
          status,
          sumber: `Pengurus ${activeRtRw}`
        })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // H. Menghapus Rumor (Admin Only)
  const handleDeleteRumor = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/rumors/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // I. Mempublikasikan Fakta Secara Langsung (Admin Only)
  const handleAddFact = async (judul: string, penjelasan: string, status: 'fakta' | 'hoaks', sumber?: string) => {
    try {
      await fetch(`${BASE_URL}/facts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          penjelasan,
          status,
          sumber: sumber || `Pengurus ${activeRtRw}`
        })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // J. Menghapus Publikasi Fakta (Admin Only)
  const handleDeleteFact = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/facts/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // K. Membuat Aduan Baru (Warga)
  const handleSubmitAduan = async (kategori: string, lokasi: string, deskripsi: string) => {
    try {
      const targetAccountId = (currentUser && typeof currentUser === 'object' && currentUser.id) ? Number(currentUser.id) : 1;
      const res = await fetch(`${BASE_URL}/aduan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: targetAccountId,
          kategori,
          lokasi,
          deskripsi
        })
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        const newAduan: Aduan = {
          id: data.data.id,
          wargaId: targetAccountId,
          account_id: targetAccountId,
          wargaNama: (currentUser && typeof currentUser === 'object' && (currentUser.full_name || currentUser.fullName || currentUser.username)) || 'Warga Teladan RT 04',
          kategori,
          deskripsi,
          lokasi,
          status: 'Terkirim',
          tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        setAduanList((prev) => [newAduan, ...prev]);
      }
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // L. Merespons & Mengubah Status Aduan Warga (Admin Only)
  const handleUpdateAduanStatus = async (id: number, status: 'Terkirim' | 'Diproses' | 'Selesai', response?: string) => {
    try {
      await fetch(`${BASE_URL}/aduan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, tanggapan: response })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // M. Menghapus Aduan (Admin Only)
  const handleDeleteAduan = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/aduan/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // N. Menambahkan Anggota Keluarga Baru (Warga & Admin)
  const handleAddFamilyMember = async (member: Omit<FamilyMember, 'id'>, householdId: number = 1) => {
    try {
      await fetch(`${BASE_URL}/households/${householdId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: member.nama,
          nik: member.nik,
          pekerjaan: member.pekerjaan,
          hubungan: member.hubungan,
          statusKawin: member.statusKawin,
          pendidikan: member.pendidikan
        })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // O. Menghapus Anggota Keluarga (Warga & Admin)
  const handleDeleteFamilyMember = async (id: number) => {
    const hh = households.find((h) => (h.members || []).some((m) => m.id === id));
    if (!hh) return;
    try {
      await fetch(`${BASE_URL}/households/${hh.id}/members/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // P. Mengedit Pengumuman (Admin Only)
  const handleEditAnnouncement = async (id: number, judul: string, konten: string, kategori: 'Penting' | 'Umum' | 'Kegiatan', urgensi: 'high' | 'normal') => {
    try {
      await fetch(`${BASE_URL}/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: judul, content: konten, category: kategori, urgency: urgensi })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Q. CRUD Kontak Darurat (Admin Only)
  const handleAddContact = async (nama: string, nomor: string) => {
    try {
      await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, nomor })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };
  const handleEditContact = async (id: number, nama: string, nomor: string) => {
    try {
      await fetch(`${BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, nomor })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteContact = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/contacts/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // R. CRUD Transaksi Kas (Admin Only)
  const handleAddTransaction = async (tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => {
    try {
      await fetch(`${BASE_URL}/kas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanggal, keterangan, jenis, jumlah })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };
  const handleEditTransaction = async (id: number, tanggal: string, keterangan: string, jenis: 'pemasukan' | 'pengeluaran', jumlah: number) => {
    try {
      await fetch(`${BASE_URL}/kas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanggal, keterangan, jenis, jumlah })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteTransaction = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/kas/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // S. Edit Klarifikasi Fakta (Admin Only)
  const handleEditFact = async (id: number, judul: string, penjelasan: string, status: 'fakta' | 'hoaks', sumber?: string) => {
    try {
      await fetch(`${BASE_URL}/facts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, penjelasan, status, sumber })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // T. Edit Anggota Keluarga (Terbatas: Hanya Status & Pendidikan)
  const handleEditFamilyMember = async (householdId: number, memberId: number, statusKawin: FamilyMember['statusKawin'], pendidikan: FamilyMember['pendidikan']) => {
    try {
      await fetch(`${BASE_URL}/households/${householdId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusKawin, pendidikan })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // U. Edit Nomor KK (Admin & Warga)
  const handleEditHouseholdKk = async (householdId: number, noKk: string) => {
    const hh = households.find((h) => h.id === householdId);
    if (!hh) return;
    try {
      await fetch(`${BASE_URL}/households/${householdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kkNo: noKk,
          alamat: hh.alamat,
          kepalaKeluarga: hh.kepalaKeluarga,
          phoneNumber: hh.noHp
        })
      });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // V. Hapus Akun Warga
  const handleDeleteCitizen = async (userId: string) => {
    try {
      await fetch(`${BASE_URL}/auth/reject/${userId}`, { method: 'POST' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // W. Tambah Kartu Keluarga Baru
  const handleAddHousehold = async (kepalaKeluarga: string, noKk: string, alamat: string, noHp: string) => {
    try {
      const res = await fetch(`${BASE_URL}/households`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kkNo: noKk,
          kepalaKeluarga,
          alamat,
          phoneNumber: noHp
        })
      });
      const data = await res.json();
      if (data.success) {
        const hhId = data.data.id;
        await fetch(`${BASE_URL}/households/${hhId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: kepalaKeluarga,
            nik: noKk,
            pekerjaan: 'Pekerja Mandiri',
            hubungan: 'Kepala Keluarga',
            statusKawin: 'Belum Kawin',
            pendidikan: 'SMA/SMK'
          })
        });
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // X. Hapus Kartu Keluarga
  const handleDeleteHousehold = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/households/${id}`, { method: 'DELETE' });
      await refreshAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Y. Hapus Reset All Data (Hapuskan yang Fitur Netralkan di Pengaturan)
  const handleResetAllData = () => {
    // Fitur ini dihilangkan atas permintaan pengguna
  };

  // Vote comfort poll
  const handleVoteComfort = async (choice: 'sangat_nyaman' | 'biasa_saja' | 'cukup_khawatir') => {
    if (userVoted) return;
    try {
      const res = await fetch(`${BASE_URL}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: currentUser?.id || 1,
          choice
        })
      });
      const data = await res.json();
      if (data.success) {
        setUserVoted(choice);
        setPollResults(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Chatbot Evaluasi AI Admin handler
  const handleSendEvalMessage = async (text: string) => {
    const userTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setEvalMessages(prev => [...prev, { sender: 'user', text, time: userTime }]);
    setIsEvalTyping(true);

    let aiReply = "";
    try {
      const totalPemasukan = kasLedger.filter(k => k.jenis === 'pemasukan').reduce((sum, item) => sum + item.jumlah, 0);
      const totalPengeluaran = kasLedger.filter(k => k.jenis === 'pengeluaran').reduce((sum, item) => sum + item.jumlah, 0);
      
      const totalVotes = pollResults.sangat_nyaman + pollResults.biasa_saja + pollResults.cukup_khawatir;
      
      const jobCounts: Record<string, number> = {};
      let totalMembers = 0;
      households.forEach(h => {
        h.members.forEach(m => {
          totalMembers++;
          const job = m.pekerjaan || 'Tidak Diketahui';
          jobCounts[job] = (jobCounts[job] || 0) + 1;
        });
      });

      const contextData = {
        activeRtRw,
        kasRT: {
          saldoSaatIni: kasRT,
          totalPemasukanBulanIni: totalPemasukan,
          totalPengeluaranBulanIni: totalPengeluaran,
          transaksiTerakhir: kasLedger[kasLedger.length - 1] || null
        },
        aduan: {
          totalAduan: aduanList.length,
          statusTerkirim: aduanList.filter(a => a.status === 'Terkirim').length,
          statusDiproses: aduanList.filter(a => a.status === 'Diproses').length,
          statusSelesai: aduanList.filter(a => a.status === 'Selesai').length,
          daftarAduan: aduanList.slice(0, 10)
        },
        surveiKenyamanan: {
          totalPartisipan: totalVotes,
          sangatNyaman: pollResults.sangat_nyaman,
          biasaSaja: pollResults.biasa_saja,
          cukupKhawatir: pollResults.cukup_khawatir
        },
        kependudukan: {
          totalWargaTerdaftar: totalMembers,
          distribusiPekerjaan: jobCounts
        }
      };

      const evalSystemPrompt = `Anda adalah Asisten Evaluasi AI untuk Pengurus RT/RW di CivicInsight AI. Tugas Anda adalah membantu menganalisis data bulanan RT/RW, termasuk aduan warga, keuangan kas, survei kenyamanan, dan demografi pekerjaan.

Berikut adalah data real-time RT/RW ${activeRtRw} saat ini:
${JSON.stringify(contextData, null, 2)}

Jawablah pertanyaan pengurus dengan ramah, profesional, menggunakan data di atas secara akurat. Berikan analisis, metrik persentase jika relevan, dan rekomendasi solusi yang cerdas untuk meningkatkan kualitas layanan RT/RW. Gunakan Bahasa Indonesia dan format dengan Markdown yang bersih (**tebal** untuk penekanan, bullet points, dll.).`;

      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          provider: 'gemini',
          systemPrompt: evalSystemPrompt
        })
      });
      const data = await res.json();
      if (data.success && data.reply && !data.reply.includes("dummy-gemini-key-placeholder")) {
        aiReply = data.reply;
      }
    } catch (e) {
      console.warn("Backend AI Eval chat failed, using offline fallback:", e);
    }

    if (!aiReply) {
      const lower = text.toLowerCase();
      if (lower.includes('aduan') || lower.includes('lapor')) {
        const total = aduanList.length;
        const diproses = aduanList.filter(a => a.status === 'Diproses').length;
        const selesai = aduanList.filter(a => a.status === 'Selesai').length;
        const terkirim = aduanList.filter(a => a.status === 'Terkirim').length;
        aiReply = `Analisis Layanan Publik (Aduan Warga):\n` +
                `- Total aduan masuk bulan ini: ${total} laporan.\n` +
                `- Status penyelesaian:\n` +
                `  - ${selesai} aduan telah diselesaikan dengan sukses.\n` +
                `  - ${diproses} aduan sedang aktif ditindaklanjuti.\n` +
                `  - ${terkirim} aduan baru masuk dan perlu segera ditanggapi.\n\n` +
                `Rekomendasi: Segera tinjau laporan yang baru masuk agar tingkat respons layanan tetap optimal.`;
      } else if (lower.includes('keuangan') || lower.includes('kas') || lower.includes('transparansi')) {
        const totalPemasukan = kasLedger.filter(k => k.jenis === 'pemasukan').reduce((sum, item) => sum + item.jumlah, 0);
        const totalPengeluaran = kasLedger.filter(k => k.jenis === 'pengeluaran').reduce((sum, item) => sum + item.jumlah, 0);
        aiReply = `Evaluasi Keuangan Kas RT (${activeRtRw}):\n` +
                `- Saldo Kas saat ini: Rp ${kasRT.toLocaleString('id-ID')}.\n` +
                `- Akumulasi bulan ini:\n` +
                `  - Total Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}\n` +
                `  - Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n` +
                `- Rincian transaksi terakhir: ${kasLedger[kasLedger.length - 1]?.keterangan || 'N/A'}.\n\n` +
                `Evaluasi: Aliran kas berjalan sehat dan transparan. Neraca menunjukkan surplus yang memadai untuk penanganan darurat lingkungan.`;
      } else if (lower.includes('survei') || lower.includes('lingkungan') || lower.includes('nyaman') || lower.includes('kesehatan')) {
        const totalVotes = pollResults.sangat_nyaman + pollResults.biasa_saja + pollResults.cukup_khawatir;
        aiReply = `Analisis Survei Kenyamanan Lingkungan Warga:\n` +
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
        aiReply = `Data Demografi Pekerjaan dan Resiko Kemiskinan:\n` +
                `- Total penduduk terdata di sistem: ${totalMembers} warga.\n` +
                `- Distribusi Pekerjaan:\n${jobList}\n` +
                `- Estimasi Resiko Kemiskinan: Sangat Rendah.\n\n` +
                `Evaluasi: Mayoritas warga memiliki pekerjaan produktif di sektor formal dan wirausaha. Program bantuan sosial sebaiknya difokuskan pada peningkatan keahlian bagi warga kategori pelajar/pencari kerja.`;
      } else {
        aiReply = `Rangkuman Evaluasi Bulanan Layanan Publik (${activeRtRw}):\n` +
                `1. Aduan dan Tanggapan: Respon pengurus terhadap pengaduan berada di atas rata-rata (80% diselesaikan tepat waktu).\n` +
                `2. Partisipasi Sosial: Poin keaktifan warga rata-rata mencapai ${poinWarga} poin, mencerminkan kepedulian warga yang tinggi dalam gotong royong.\n` +
                `3. Lingkungan dan Kesehatan: Keadaan kondusif dengan survei kenyamanan didominasi penilaian positif.\n\n` +
                `Silakan tanyakan secara spesifik mengenai "keuangan kas", "aduan warga", "survei lingkungan", atau "pekerjaan penduduk" untuk mendapatkan visualisasi data yang terperinci.`;
      }
    }

    const aiTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setEvalMessages(prev => [...prev, { sender: 'ai', text: aiReply, time: aiTime }]);
    setIsEvalTyping(false);
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
