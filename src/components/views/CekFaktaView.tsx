import React from 'react';
import { Fact, Rumor } from '../../types';
import { ShieldCheck, ShieldAlert, Search, Send, Plus, Trash2, HelpCircle, Check, X, FileText, Bot, Loader2, Edit } from 'lucide-react';

const BASE_URL = process.env.VITE_API_URL || 'https://civicinsight-ai-backend.up.railway.app';

/**
 * Interface props untuk CekFaktaView
 */
export interface CekFaktaViewProps {
  isAdmin: boolean; // Peran pengguna
  verifiedFacts: Fact[]; // Daftar fakta yang sudah terverifikasi admin
  submittedRumors: Rumor[]; // Isu/Rumor yang dilaporkan warga untuk diperiksa
  onSubmitRumor: (konten: string) => void; // Aksi warga melaporkan rumor baru
  onVerifyRumor: (id: number, status: 'fakta' | 'hoaks', penjelasan: string) => void; // Aksi admin memverifikasi rumor
  onDeleteRumor: (id: number) => void; // Aksi admin menghapus rumor aduan
  onAddFact: (judul: string, penjelasan: string, status: 'fakta' | 'hoaks', sumber?: string) => void; // Aksi admin memposting fakta langsung
  onDeleteFact: (id: number) => void; // Aksi admin menghapus arsip fakta
  onEditFact: (id: number, judul: string, penjelasan: string, status: 'fakta' | 'hoaks', sumber?: string) => void; // Aksi admin mengubah fakta
}

export const CekFaktaView: React.FC<CekFaktaViewProps> = ({
  isAdmin,
  verifiedFacts,
  submittedRumors,
  onSubmitRumor,
  onVerifyRumor,
  onDeleteRumor,
  onAddFact,
  onDeleteFact,
  onEditFact,
}) => {
  // State pencarian fakta (Warga & Admin)
  const [searchQuery, setSearchQuery] = React.useState('');

  // State warga melapor rumor
  const [rumorText, setRumorText] = React.useState('');

  // State admin input fakta langsung
  const [factJudul, setFactJudul] = React.useState('');
  const [factPenjelasan, setFactPenjelasan] = React.useState('');
  const [factStatus, setFactStatus] = React.useState<'fakta' | 'hoaks'>('fakta');
  const [factSumber, setFactSumber] = React.useState('');

  // State Edit Fakta Modal
  const [editingFact, setEditingFact] = React.useState<Fact | null>(null);
  const [editFactJudul, setEditFactJudul] = React.useState('');
  const [editFactPenjelasan, setEditFactPenjelasan] = React.useState('');
  const [editFactStatus, setEditFactStatus] = React.useState<'fakta' | 'hoaks'>('fakta');
  const [editFactSumber, setEditFactSumber] = React.useState('');

  // State admin memverifikasi rumor terpilih (membuka panel/form penjelasan)
  const [selectedRumorId, setSelectedRumorId] = React.useState<number | null>(null);
  const [verifikasiPenjelasan, setVerifikasiPenjelasan] = React.useState('');

  // Chatbot State
  const [chatMessages, setChatMessages] = React.useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Halo! Saya ChatBot Cek Fakta. Di sini Anda bisa menelusuri artikel berita nasional (CNN & Tempo), memantau laporan aduan JAKI, mengecek status bansos, serta mencari informasi kesehatan masyarakat. Silakan ketik topik atau kata kunci yang ingin Anda cari.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [inputText, setInputText] = React.useState('');
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const parseBoldAndLinks = (line: string) => {
    const parts = line.split(/(\*\*|\*)/g);
    let isBold = false;
    return parts.map((part, idx) => {
      if (part === '**' || part === '*') {
        isBold = !isBold;
        return null;
      }
      
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(part)) {
        const subParts = part.split(urlRegex);
        return (
          <span key={idx}>
            {subParts.map((subPart, subIdx) => {
              if (urlRegex.test(subPart)) {
                return (
                  <a
                    key={subIdx}
                    href={subPart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-650 hover:text-teal-800 underline font-bold break-all"
                  >
                    {subPart}
                  </a>
                );
              }
              return isBold ? <strong key={subIdx} className="font-extrabold text-slate-900">{subPart}</strong> : subPart;
            })}
          </span>
        );
      }

      return isBold ? <strong key={idx} className="font-extrabold text-slate-900">{part}</strong> : part;
    });
  };

  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => (
      <div key={lineIdx} className="min-h-[1.25rem]">
        {parseBoldAndLinks(line)}
      </div>
    ));
  };

  // Auto-scroll chat container
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const userTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: userTime }]);
    setInputText('');
    setIsTyping(true);

    try {
      const lower = userText.toLowerCase().trim();
      let reply = '';

      // Stopwords for clean search extraction
      const stopwords = [
        'apakah', 'ada', 'berita', 'tentang', 'info', 'kabar', 'saya', 'ingin', 'tahu', 
        'tanyakan', 'cari', 'mengenai', 'laporan', 'isu', 'yang', 'di', 'ke', 
        'dari', 'untuk', 'pada', 'dengan', 'adalah', 'sebagai', 'terbaru', 'hari', 'ini',
        'bisa', 'tolong', 'bagaimana', 'apa', 'siapa', 'kapan', 'mengapa', 'gimana', 'dong',
        'cnn', 'tempo', 'jaki', 'jakarta', 'bansos', 'sehat', 'kesehatan',
        'bantuan', 'sosial', 'mana', 'nya', 'dan', 'atau', 'juga', 'sudah', 'belum',
        'akan', 'baru', 'lagi', 'saat', 'sedang', 'masih', 'semua', 'lebih', 'sangat',
        'harus', 'banyak', 'seperti', 'mereka', 'kami', 'kita', 'tersebut'
      ];
      
      const cleanText = lower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
      const words = cleanText.split(/\s+/);
      const searchWords = words.filter(w => !stopwords.includes(w) && w.length > 2);
      const searchTerm = searchWords.join(' ');

      // --- INTENT CLASSIFICATION ---

      // 1. BANSOS intent
      if (lower.includes('bansos') || lower.includes('bantuan sosial') || lower.includes('bpnt') || lower.includes('pkh') || lower.includes('pbi-jk') || lower.includes('dtks')) {
        try {
          const res = await fetch(`${BASE_URL}/news/bansos`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            let filtered = data;
            if (searchTerm) {
              filtered = data.filter((item: any) => 
                item.nama.toLowerCase().includes(searchTerm) || 
                item.nik.toLowerCase().includes(searchTerm) ||
                item.wilayah.toLowerCase().includes(searchTerm)
              );
            }
            
            if (filtered.length > 0) {
              reply = `💰 **[API CEK BANSOS REAL-TIME]**\nStatus penerima bantuan sosial:${searchTerm ? ` (Pencarian: "${searchTerm}")` : ''}\n\n` + 
                filtered.map((item: any) => `👤 **Nama**: ${item.nama}\n🆔 **NIK**: ${item.nik}\n📍 **Wilayah**: ${item.wilayah}\n🍚 **BPNT**: ${item.bpnt}\n🎓 **PKH**: ${item.pkh}\n🏥 **PBI-JK**: ${item.pbi_jk}`).join('\n\n');
            } else {
              reply = `💰 **[API CEK BANSOS REAL-TIME]**\nTidak ada data penerima bansos yang cocok dengan pencarian **"${searchTerm}"**.\n\n**Coba ketik nama warga penerima bansos lainnya.**`;
            }
          } else {
            reply = `💰 **[API CEK BANSOS REAL-TIME]**\nData bansos kosong atau tidak ditemukan.`;
          }
        } catch (e) {
          reply = `💰 **[API CEK BANSOS REAL-TIME]**\nGagal memuat data bansos. Silakan coba lagi nanti.`;
        }
      } 
      // 2. JAKI intent
      else if (lower.includes('jaki') || (lower.includes('jakarta') && (lower.includes('aduan') || lower.includes('lapor') || lower.includes('infrastruktur')))) {
        try {
          const res = await fetch(`${BASE_URL}/news/jaki`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            let filtered = data;
            if (searchTerm) {
              filtered = data.filter((item: any) => 
                item.kategori.toLowerCase().includes(searchTerm) || 
                item.lokasi.toLowerCase().includes(searchTerm) ||
                item.deskripsi.toLowerCase().includes(searchTerm) ||
                item.status.toLowerCase().includes(searchTerm)
              );
            }
            
            if (filtered.length > 0) {
              reply = `🏙️ **[API JAKI REPORTS REAL-TIME]**\nLaporan warga terbaru di sistem JAKI:${searchTerm ? ` (Pencarian: "${searchTerm}")` : ''}\n\n` + 
                filtered.map((item: any) => `🆔 **${item.id}** - **${item.kategori}**\n📍 Lokasi: ${item.lokasi}\n📝 Deskripsi: ${item.deskripsi}\n⚡ Status: **${item.status}**`).join('\n\n');
            } else {
              reply = `🏙️ **[API JAKI REPORTS REAL-TIME]**\nTidak ada laporan JAKI yang cocok dengan kata kunci **"${searchTerm}"**.`;
            }
          } else {
            reply = `🏙️ **[API JAKI REPORTS REAL-TIME]**\nTidak ada laporan JAKI yang tersedia saat ini.`;
          }
        } catch (e) {
          reply = `🏙️ **[API JAKI REPORTS REAL-TIME]**\nGagal memuat laporan JAKI. Silakan coba lagi nanti.`;
        }
      } 
      // 3. HEALTH intent — expanded keyword list for Indonesian health topics
      else if (
        lower.includes('sehat') || lower.includes('kesehatan') || lower.includes('dbd') || 
        lower.includes('virus') || lower.includes('medis') || lower.includes('sakit') || 
        lower.includes('health') || lower.includes('medicine') || lower.includes('penyakit') ||
        lower.includes('demam') || lower.includes('stunting') || lower.includes('gizi') ||
        lower.includes('imunisasi') || lower.includes('vaksin') || lower.includes('tbc') ||
        lower.includes('malaria') || lower.includes('hiv') || lower.includes('aids') ||
        lower.includes('diabetes') || lower.includes('kolesterol') || lower.includes('hipertensi') ||
        lower.includes('covid') || lower.includes('corona') || lower.includes('obat') ||
        lower.includes('rumah sakit') || lower.includes('puskesmas') || lower.includes('bpjs') ||
        lower.includes('kematian') || lower.includes('kelahiran') || lower.includes('harapan hidup') ||
        lower.includes('sanitasi') || lower.includes('air bersih') || lower.includes('diare') ||
        lower.includes('pneumonia') || lower.includes('campak') || lower.includes('polio') ||
        lower.includes('hepatitis') || lower.includes('kanker') || lower.includes('jantung')
      ) {
        try {
          // Build a better query word for health search
          const healthKeywords = ['dbd', 'virus', 'stunting', 'gizi', 'tbc', 'malaria', 'hiv', 'aids',
            'diabetes', 'kolesterol', 'hipertensi', 'covid', 'corona', 'diare', 'pneumonia',
            'campak', 'polio', 'hepatitis', 'kanker', 'jantung', 'demam', 'vaksin', 'imunisasi',
            'kematian', 'kelahiran', 'sanitasi', 'obat', 'puskesmas', 'bpjs'];
          const matchedHealthKeyword = healthKeywords.find(k => lower.includes(k));
          const queryWord = searchTerm || matchedHealthKeyword || '';
          
          const res = await fetch(`${BASE_URL}/health/news?q=${encodeURIComponent(queryWord)}`);
          const data = await res.json();
          const list = data.value || data;
          
          let healthReply = '';
          if (Array.isArray(list) && list.length > 0) {
            let filtered = list;
            if (queryWord) {
              filtered = list.filter((item: any) => 
                item.IndicatorName.toLowerCase().includes(queryWord.toLowerCase()) || 
                item.IndicatorCode.toLowerCase().includes(queryWord.toLowerCase())
              );
            }
            
            if (filtered.length > 0) {
              healthReply = `🏥 **[API KESEHATAN REAL-TIME - INDIKATOR KESEHATAN GLOBAL]**\nBerikut adalah beberapa indikator kesehatan terkait:${queryWord ? ` (Pencarian: "${queryWord}")` : ''}\n\n` + 
                filtered.slice(0, 5).map((item: any) => `🩺 **${item.IndicatorName}**\n🔑 Kode: ${item.IndicatorCode}`).join('\n\n');
            }
          }
          
          // If WHO API doesn't give relevant results, ask AI with health context
          if (!healthReply) {
            const healthSystemPrompt = `Anda adalah Chatbot Kesehatan & Cek Fakta di CivicInsight AI. Tugas Anda:
1. Menjawab pertanyaan kesehatan masyarakat (penyakit, pencegahan, gizi, vaksinasi, dll.)
2. Memberikan informasi kesehatan yang akurat berdasarkan sumber WHO, Kemenkes RI
3. Menjelaskan istilah medis dalam bahasa sederhana
4. Memberikan saran pencegahan penyakit

Penting:
- Jawab SELALU dalam Bahasa Indonesia
- Format dengan Markdown (**tebal** untuk penekanan)
- Jika ditanya hal di luar kesehatan, arahkan ke fitur chatbot yang sesuai
- Berikan disclaimer bahwa saran medis tetap harus dikonsultasikan ke tenaga kesehatan profesional`;

            try {
              const aiRes = await fetch(`${BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  message: userText,
                  provider: 'gemini',
                  systemPrompt: healthSystemPrompt
                })
              });
              const aiData = await aiRes.json();
              if (aiData.success && aiData.reply && !aiData.reply.includes("dummy-gemini-key-placeholder")) {
                healthReply = `🏥 **[ASISTEN KESEHATAN AI]**\n\n${aiData.reply}`;
              }
            } catch (aiErr) {
              console.warn("Health AI fallback failed:", aiErr);
            }
          }
          
          reply = healthReply || `🏥 **[API KESEHATAN]**\nMaaf, tidak ditemukan informasi kesehatan spesifik untuk topik tersebut. Silakan coba kata kunci lain seperti: **dbd**, **stunting**, **gizi**, **vaksin**, **tbc**, **diabetes**, **hipertensi**.`;
        } catch (e) {
          reply = `🏥 **[API KESEHATAN]**\nGagal memuat data indikator kesehatan. Silakan coba lagi nanti.`;
        }
      } 
      // 4. NEWS search — CNN and Tempo
      else {
        const queryTerm = searchTerm || lower;
        
        // Greeting detection
        const isGreeting = ['halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'selamat'].some(g => lower.includes(g)) && lower.length < 30;
        // Navigation/help request detection
        const isNavigation = lower.includes('konsultasi') || lower.includes('panduan') || lower.includes('menu');
        
        if (!isGreeting && !isNavigation && queryTerm) {
          try {
            const [cnnRes, tempoRes] = await Promise.all([
              fetch(`${BASE_URL}/news/cnn/search?q=${encodeURIComponent(queryTerm)}`),
              fetch(`${BASE_URL}/news/tempo/search?q=${encodeURIComponent(queryTerm)}`)
            ]);
            
            const cnnData = await cnnRes.json();
            const tempoData = await tempoRes.json();
            
            const hasCnn = Array.isArray(cnnData) && cnnData.length > 0;
            const hasTempo = Array.isArray(tempoData) && tempoData.length > 0;
            
            if (hasCnn || hasTempo) {
              reply = `🔍 **[HASIL PENCARIAN BERITA REAL-TIME: "${queryTerm}"]**\n\n`;
              if (hasCnn) {
                reply += `📰 **CNN Indonesia**:\n` + 
                  cnnData.slice(0, 2).map((item: any) => `- **${item.title}**\n  ${item.description || ''}\n  🔗 ${item.url}`).join('\n\n') + `\n\n`;
              }
              if (hasTempo) {
                reply += `📰 **Tempo**:\n` + 
                  tempoData.slice(0, 2).map((item: any) => `- **${item.title}**\n  ${item.content || ''}\n  🔗 ${item.link}`).join('\n\n');
              }
            } else {
              // No news found — try AI for social issue / general knowledge
              const cekFaktaSystemPrompt = `Anda adalah Chatbot Cek Fakta & Isu Sosial untuk warga RT/RW di CivicInsight AI. Tugas Anda:
1. Membantu memverifikasi kebenaran informasi dan berita
2. Memberikan analisis isu sosial terkini (kemiskinan, pendidikan, korupsi, lingkungan, politik, ekonomi)
3. Menjawab pertanyaan umum tentang isu-isu sosial Indonesia
4. Memberikan konteks dan fakta terkait isu yang ditanyakan

Penting:
- Jawab SELALU dalam Bahasa Indonesia
- Format dengan Markdown (**tebal** untuk penekanan, link jika ada)
- Berikan fakta yang objektif dan seimbang
- Jika tidak tahu, katakan jujur dan arahkan ke sumber terpercaya`;

              try {
                const aiRes = await fetch(`${BASE_URL}/ai/chat`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    message: userText,
                    provider: 'gemini',
                    systemPrompt: cekFaktaSystemPrompt
                  })
                });
                const aiData = await aiRes.json();
                if (aiData.success && aiData.reply && !aiData.reply.includes("dummy-gemini-key-placeholder")) {
                  reply = aiData.reply;
                }
              } catch (aiErr) {
                console.warn("Cek Fakta AI fallback failed:", aiErr);
              }
              
              if (!reply) {
                const latestRes = await fetch(`${BASE_URL}/news/cnn`);
                const latestData = await latestRes.json();
                reply = `🔍 **[PENCARIAN BERITA: "${queryTerm}"]**\nMaaf, tidak ditemukan berita khusus mengenai kata kunci tersebut.\n\n` +
                  `📰 **Berikut berita terhangat hari ini sebagai gantinya:**\n\n` +
                  latestData.slice(0, 3).map((item: any) => `📌 **${item.title}**\n🔗 Selengkapnya: ${item.url}`).join('\n\n');
              }
            }
          } catch (e) {
            reply = `🔍 **[PENCARIAN BERITA]**\nGagal melakukan pencarian berita. Silakan coba lagi nanti.`;
          }
        } 
        else if (isNavigation) {
          reply = 'ℹ️ **[PANDUAN SISTEM PORTAL]**\nUntuk bantuan administrasi surat pengantar RT, silakan gunakan menu **Konsultasi AI** di navigasi atas. Jika ingin melaporkan infrastruktur rusak, gunakan menu **Lapor Aduan**. Chatbot ini khusus untuk memantau berita & kesehatan nasional.';
        } 
        else {
          // Greeting or very short messages — use AI with Cek Fakta identity
          const greetingSystemPrompt = `Anda adalah Chatbot Cek Fakta & Isu Sosial di CivicInsight AI. Sapa warga dengan ramah dan jelaskan bahwa Anda bisa membantu:
1. Mencari berita terkini dari CNN Indonesia & Tempo
2. Mengecek data penerima Bansos (BPNT, PKH, PBI-JK)
3. Melihat laporan aduan JAKI Jakarta
4. Menjawab pertanyaan kesehatan masyarakat
5. Memverifikasi fakta dan isu sosial

Jawab dalam Bahasa Indonesia, singkat dan ramah. Format dengan Markdown (**tebal** untuk penekanan).`;

          try {
            const res = await fetch(`${BASE_URL}/ai/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                message: userText,
                provider: 'gemini',
                systemPrompt: greetingSystemPrompt
              })
            });
            const data = await res.json();
            if (data.success && data.reply && !data.reply.includes("dummy-gemini-key-placeholder")) {
              reply = data.reply;
            }
          } catch (e) {
            console.warn("Cek Fakta greeting AI failed:", e);
          }

          if (!reply) {
            reply = `🤖 **[CHATBOT CEK FAKTA]**\nHalo! Tanyakan saya apa saja tentang isu sosial/berita nasional, laporan JAKI, status Bansos, atau kesehatan:\n\n` +
              `• **berita** (contoh: **"berita tentang mudik"**, **"longsor tempo"**)\n` +
              `• **jaki** (contoh: **"aduan jaki jalan rusak"**, **"jaki selesai"**)\n` +
              `• **bansos** (contoh: **"apakah bansos rayyan cair?"**, **"bansos bpnt"**)\n` +
              `• **kesehatan** (contoh: **"kesehatan dbd"**, **"info stunting"**, **"vaksin polio"**)\n\n` +
              `Ketik kata kunci atau topik pencarian Anda secara langsung!`;
          }
        }
      }

      const aiTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply, time: aiTime }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (isTyping) return;
    setInputText(question);
  };

  // Filter daftar fakta yang cocok dengan kata kunci pencarian
  const filteredFacts = React.useMemo(() => {
    if (!searchQuery.trim()) return verifiedFacts;
    const q = searchQuery.toLowerCase();
    return verifiedFacts.filter(
      (f) => f.judul.toLowerCase().includes(q) || f.penjelasan.toLowerCase().includes(q)
    );
  }, [verifiedFacts, searchQuery]);

  const handleReportRumor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rumorText.trim()) return;
    onSubmitRumor(rumorText.trim());
    setRumorText('');
    alert('Desas-desus/Isu berhasil dilaporkan! Pengurus RT akan segera meneliti kebenaran berita ini.');
  };

  const handlePostDirectFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factJudul.trim() || !factPenjelasan.trim()) return;
    onAddFact(factJudul.trim(), factPenjelasan.trim(), factStatus, factSumber.trim() || undefined);
    setFactJudul('');
    setFactPenjelasan('');
    setFactStatus('fakta');
    setFactSumber('');
    alert('Informasi fakta berhasil diterbitkan ke arsip publik!');
  };

  const handleConfirmVerification = (rumorId: number, status: 'fakta' | 'hoaks') => {
    if (!verifikasiPenjelasan.trim()) {
      alert('Harap tuliskan penjelasan/klarifikasi singkat terlebih dahulu agar warga paham!');
      return;
    }
    onVerifyRumor(rumorId, status, verifikasiPenjelasan.trim());
    setSelectedRumorId(null);
    setVerifikasiPenjelasan('');
    alert('Isu berhasil diverifikasi dan dipindahkan ke arsip fakta publik!');
  };

  return (
    <div className="space-y-6">
      
      {/* KONTROL UTAMA: PENCARIAN FAKTA (Tampil untuk Warga & Admin) */}
      <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          <ShieldCheck className="text-civic-primary shrink-0" size={20} />
          Cari Kebenaran Berita RT/RW
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Masukkan kata kunci kabar burung atau berita yang beredar di WhatsApp warga untuk memverifikasi kebenarannya.
        </p>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik kata kunci... (contoh: bansos, kerja bakti, fogging, maling)"
            className="w-full border border-slate-350 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-civic-primary text-base bg-slate-100"
            autoComplete="off"
          />
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
      </div>

      {/* DUA VERSI LAYOUT: WARGA VS ADMIN */}
      {!isAdmin ? (
        /* ======================== VIEW WARGA ======================== */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Hasil Pencarian Fakta (2 Kolom) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-800 px-1">
              {searchQuery ? `Hasil Pencarian (${filteredFacts.length})` : 'Informasi yang Sudah Diverifikasi'}
            </h3>

            {filteredFacts.length === 0 ? (
              <div className="bg-civic-surface text-center py-10 rounded-2xl border border-dashed border-slate-200">
                <HelpCircle className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm text-slate-500 font-semibold">Berita belum terdaftar dalam sistem.</p>
                <p className="text-xs text-slate-400 mt-1">Anda bisa melaporkannya di panel samping agar diteliti Pak RT.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFacts.map((fact) => {
                  const isFact = fact.status === 'fakta';
                  return (
                    <div
                      key={fact.id}
                      className={`bg-civic-surface rounded-2xl border p-5 shadow-xs transition-all duration-200 ${
                        isFact ? 'border-l-4 border-l-emerald-500 border-slate-200' : 'border-l-4 border-l-rose-500 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isFact ? (
                          <>
                            <ShieldCheck className="text-emerald-700 shrink-0" size={20} />
                            <span className="font-extrabold text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Fakta</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="text-rose-700 shrink-0" size={20} />
                            <span className="font-extrabold text-[10px] uppercase tracking-wider bg-rose-100 text-rose-850 px-2 py-0.5 rounded">Hoaks / Bohong</span>
                          </>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium ml-auto">{fact.tanggal}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-slate-850 text-base mb-2">{fact.judul}</h4>
                      <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line">{fact.penjelasan}</p>
                      
                      {fact.sumber && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-400 font-medium">
                          Sumber resmi: <span className="text-slate-600 font-bold">{fact.sumber}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Form Lapor Isu/WhatsApp Desas-Desus */}
          <div className="lg:col-span-1">
            <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <HelpCircle className="text-teal-700 shrink-0" size={20} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Adukan Isu/Berita Baru</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                Menemukan berita mencurigakan di grup WA keluarga atau tetangga? Tempel dan laporkan di sini agar Pak RT memverifikasinya.
              </p>

              <form onSubmit={handleReportRumor} autoComplete="off" className="space-y-4">
                <div>
                  <label htmlFor="rumor-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Konten Berita / Tangkapan Teks:
                  </label>
                  <textarea
                    id="rumor-input"
                    rows={4}
                    required
                    value={rumorText}
                    onChange={(e) => setRumorText(e.target.value)}
                    placeholder="Contoh: Bantuan sosial tambahan sebesar 100 ribu dibagikan besok malam jam 8 di kelurahan..."
                    className="w-full border border-slate-350 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-civic-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-teal-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send size={16} />
                  Kirim ke Pengurus RT
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* ChatBot Cek Isu & Kesehatan (API Real-Time) */}
        <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[480px] overflow-hidden mt-6">
          {/* Header */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">ChatBot Isu Sosial & Kesehatan</h3>
                <p className="text-[10px] text-slate-455 font-bold leading-none mt-0.5">Integrasi API Berita & Kesehatan Real-Time</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider">API Aktif</span>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
          >
            {chatMessages.map((msg, idx) => {
               const isUser = msg.sender === 'user';
               if (isUser) {
                 return (
                   <div key={idx} className="flex w-full justify-end">
                     <div className="max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 bg-slate-900 text-white shadow-2xs text-sm font-medium rounded-tr-none">
                       <div className="leading-relaxed">{renderMessageText(msg.text)}</div>
                       <span className="block text-right text-[9px] mt-1 font-bold text-slate-400">
                         {msg.time}
                       </span>
                     </div>
                   </div>
                 );
               } else {
                 return (
                   <div key={idx} className="flex w-full justify-start items-start gap-2.5">
                     <div className="w-8 h-8 rounded-full bg-civic-primary text-white flex items-center justify-center shrink-0 shadow-3xs select-none mt-0.5">
                       <Bot size={16} />
                     </div>
                     <div className="max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 bg-white text-slate-800 border border-slate-100 shadow-3xs text-sm font-medium rounded-tl-none">
                       <div className="leading-relaxed">{renderMessageText(msg.text)}</div>
                       <span className="block text-left text-[9px] mt-1 font-bold text-slate-400">
                         {msg.time}
                       </span>
                     </div>
                   </div>
                 );
               }
             })}

            {isTyping && (
              <div className="flex justify-start items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-civic-primary text-white flex items-center justify-center shrink-0 shadow-3xs select-none mt-0.5">
                  <Bot size={16} />
                </div>
                <div className="bg-white text-slate-650 border border-slate-105 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 shadow-3xs">
                  <Loader2 size={14} className="text-civic-primary animate-spin" />
                  <span className="text-[11px] font-extrabold text-slate-500">Mencari informasi API...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-150 flex flex-wrap gap-1.5 items-center justify-center shrink-0">
            <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={10} />
              Topik Populer:
            </span>
            <button
              type="button"
              onClick={() => handleSuggestionClick('Bagaimana berita terhangat nasional hari ini?')}
              className="bg-white border border-slate-200 hover:border-teal-650 text-slate-700 hover:text-teal-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs select-none"
            >
              Berita Terhangat
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick('Bagaimana pencegahan DBD di musim hujan?')}
              className="bg-white border border-slate-200 hover:border-teal-650 text-slate-700 hover:text-teal-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs select-none"
            >
              Pencegahan DBD
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick('Apa saja aksi sosial nasional terbaru?')}
              className="bg-white border border-slate-200 hover:border-teal-650 text-slate-700 hover:text-teal-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs select-none"
            >
              Aksi Sosial Nasional
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} autoComplete="off" className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan isu sosial atau berita kesehatan di sini..."
              className="flex-1 border border-slate-250 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-civic-primary text-sm disabled:bg-slate-55 bg-slate-100"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="bg-civic-primary text-white p-2.5 rounded-xl hover:bg-teal-800 disabled:bg-slate-200 transition-all flex items-center justify-center shrink-0 min-w-[44px] cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </>
    ) : (
        /* ======================== VIEW ADMIN (KELOLA) ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Verifikasi Laporan Rumor Warga (2 Kolom) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-800 px-1">
              Desas-Desus yang Dilaporkan Warga ({submittedRumors.length})
            </h3>

            {submittedRumors.length === 0 ? (
              <div className="bg-civic-surface text-center py-10 rounded-2xl border border-dashed border-slate-200">
                <Check className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-sm text-slate-500 font-bold">Semua bersih!</p>
                <p className="text-xs text-slate-400 mt-1">Belum ada isu/rumor baru yang dilaporkan warga.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedRumors.map((rumor) => {
                  const isResolving = selectedRumorId === rumor.id;
                  return (
                    <div
                      key={rumor.id}
                      className="bg-civic-surface rounded-2xl border border-slate-250 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            Aduan Isu
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{rumor.tanggal}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          "{rumor.konten}"
                        </p>
                        <p className="text-xs text-slate-450 mt-2 font-medium">
                          Dilaporkan oleh: <span className="text-slate-700 font-bold">{rumor.wargaNama}</span>
                        </p>
                      </div>

                      {/* Panel Aksi Verifikasi */}
                      {isResolving ? (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tulis Penjelasan / Klarifikasi Resmi RT:
                            </label>
                            <textarea
                              rows={3}
                              required
                              value={verifikasiPenjelasan}
                              onChange={(e) => setVerifikasiPenjelasan(e.target.value)}
                              placeholder="Tulis alasan mengapa ini hoaks/fakta. Sebutkan buktinya agar warga percaya..."
                              className="w-full border border-slate-300 rounded-xl p-3 text-slate-855 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                              autoComplete="off"
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleConfirmVerification(rumor.id, 'fakta')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check size={14} />
                              Verifikasi FAKTA
                            </button>
                            <button
                              onClick={() => handleConfirmVerification(rumor.id, 'hoaks')}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <X size={14} />
                              Verifikasi HOAKS
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRumorId(null);
                                setVerifikasiPenjelasan('');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-slate-150 flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedRumorId(rumor.id)}
                            className="bg-civic-primary hover:opacity-90 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                          >
                            Verifikasi Isu
                          </button>
                          <button
                            onClick={() => onDeleteRumor(rumor.id)}
                            className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl cursor-pointer"
                            title="Hapus Aduan Isu"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Arsip Fakta (Admin can view and delete them) */}
            <div className="pt-4">
              <h3 className="text-base font-bold text-slate-800 px-1 mb-3">Arsip Kebenaran Informasi Publik</h3>
              <div className="space-y-3">
                {filteredFacts.map((fact) => (
                  <div key={fact.id} className="bg-civic-surface rounded-xl border border-slate-200 p-4 flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          fact.status === 'fakta' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {fact.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{fact.tanggal}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{fact.judul}</h4>
                    </div>
                    <div className="flex gap-1.5 items-center select-none shrink-0">
                      <button
                        onClick={() => {
                          setEditingFact(fact);
                          setEditFactJudul(fact.judul);
                          setEditFactPenjelasan(fact.penjelasan);
                          setEditFactStatus(fact.status === 'belum_verifikasi' ? 'fakta' : fact.status);
                          setEditFactSumber(fact.sumber || '');
                        }}
                        className="text-slate-400 hover:text-blue-650 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Edit Arsip Fakta"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus arsip fakta ini dari publik?')) {
                            onDeleteFact(fact.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Hapus Arsip Fakta"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form Posting Fakta Langsung (Tanpa rumor) */}
          <div className="lg:col-span-1">
            <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <Plus className="text-civic-primary shrink-0" size={20} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tulis Fakta Baru</h3>
              </div>

              <form onSubmit={handlePostDirectFact} autoComplete="off" className="space-y-4">
                <div>
                  <label htmlFor="direct-title" className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Kasus / Berita:
                  </label>
                  <input
                    id="direct-title"
                    type="text"
                    required
                    value={factJudul}
                    onChange={(e) => setFactJudul(e.target.value)}
                    placeholder="Contoh: Isu Penculikan Anak Gang 3"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="direct-status" className="block text-xs font-bold text-slate-700 mb-1">
                      Status Kebenaran:
                    </label>
                    <select
                      id="direct-status"
                      value={factStatus}
                      onChange={(e) => setFactStatus(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-slate-100 text-slate-855 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary"
                    >
                      <option value="fakta">FAKTA</option>
                      <option value="hoaks">HOAKS</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="direct-source" className="block text-xs font-bold text-slate-700 mb-1">
                      Sumber (Opsional):
                    </label>
                    <input
                      id="direct-source"
                      type="text"
                      value={factSumber}
                      onChange={(e) => setFactSumber(e.target.value)}
                      placeholder="Babinkamtibmas/Polsek"
                      className="w-full border border-slate-300 rounded-xl px-2 py-1.5 text-slate-855 text-xs focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="direct-explanation" className="block text-xs font-bold text-slate-700 mb-1">
                    Penjelasan Lengkap:
                  </label>
                  <textarea
                    id="direct-explanation"
                    rows={4}
                    required
                    value={factPenjelasan}
                    onChange={(e) => setFactPenjelasan(e.target.value)}
                    placeholder="Tulis klarifikasi detail untuk meluruskan kesalahpahaman warga..."
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-civic-primary bg-slate-100"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-civic-primary hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                >
                  Terbitkan Hasil Verifikasi
                </button>
              </form>
            </div>
          </div>

      </div>
    )}

      {/* Modal Edit Fakta (Admin Only) */}
      {isAdmin && editingFact && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-805">Edit Klarifikasi Informasi</h3>
              <button 
                onClick={() => { setEditingFact(null); }}
                className="text-slate-400 hover:text-slate-655 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editFactJudul.trim() && editFactPenjelasan.trim()) {
                  onEditFact(editingFact.id, editFactJudul.trim(), editFactPenjelasan.trim(), editFactStatus, editFactSumber.trim() || undefined);
                  setEditingFact(null);
                  alert('Klarifikasi informasi resmi berhasil diperbarui!');
                }
              }}
              autoComplete="off"
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kasus / Berita:</label>
                <input
                  type="text"
                  required
                  value={editFactJudul}
                  onChange={(e) => setEditFactJudul(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none bg-slate-100"
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Kebenaran:</label>
                  <select
                    value={editFactStatus}
                    onChange={(e) => setEditFactStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2 py-2 bg-slate-100 text-slate-800 focus:outline-none"
                  >
                    <option value="fakta">FAKTA</option>
                    <option value="hoaks">HOAKS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sumber Resmi:</label>
                  <input
                    type="text"
                    value={editFactSumber}
                    onChange={(e) => setEditFactSumber(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none bg-slate-100"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penjelasan Lengkap:</label>
                <textarea
                  rows={4}
                  required
                  value={editFactPenjelasan}
                  onChange={(e) => setEditFactPenjelasan(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none bg-slate-100"
                  autoComplete="off"
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
                  onClick={() => setEditingFact(null)}
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
