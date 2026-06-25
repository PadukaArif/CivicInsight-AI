import React from 'react';
import { ChatMessage } from '../../types';
import { Bot, Send, HelpCircle, Loader2 } from 'lucide-react';

/**
 * Interface props untuk KonsultasiAIView
 */
export interface KonsultasiAIViewProps {
  chatMessages: ChatMessage[]; // Riwayat obrolan chat
  onSendChatMessage: (text: string) => void; // Aksi mengirim pesan
  isTyping: boolean; // Status asisten sedang memikirkan/mengetik jawaban
}

// Daftar pertanyaan populer yang ramah untuk warga lansia
const suggestedQuestions = [
  'Cara urus KTP hilang?',
  'Jadwal imunisasi Balita?',
  'Iuran kas bulanan warga?',
  'Syarat KK baru?',
];

export const KonsultasiAIView: React.FC<KonsultasiAIViewProps> = ({
  chatMessages,
  onSendChatMessage,
  isTyping,
}) => {
  const [input, setInput] = React.useState('');
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
                    className="text-teal-600 hover:text-teal-800 underline font-bold break-all"
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

  // Auto-scroll container obrolan internal ke paling bawah saat ada pesan baru tanpa memicu scroll window/body
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendChatMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (question: string) => {
    if (isTyping) return;
    onSendChatMessage(question);
  };

  return (
    /* 
      Container Utama: Mengembangkan tinggi menjadi h-[calc(100vh-8.5rem)]
      agar console chat memanjang ke bawah memanfaatkan seluruh sisa tinggi layar secara efisien.
    */
    <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-8.5rem)] min-h-[420px] overflow-hidden">
      
      {/* 1. Header Chat (Status Koneksi API & Logo Bot Keren) */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          {/* Logo Konsultasi AI Keren Baru: Robot Minimalis Bergradasi */}
          <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-xs shrink-0">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">Asisten AI Warga</h3>
            <p className="text-[10px] text-slate-455 font-bold leading-none mt-0.5">Layanan Informasi RT/RW Otomatis</p>
          </div>
        </div>

        {/* Indikator Status API */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider">API Siap</span>
        </div>
      </div>

      {/* 2. Area Pesan Chat Log (Warna Kontras Tinggi & Bersih) */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        {chatMessages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          
          if (isUser) {
            // Tampilan Pesan User (Rapat di kanan, kontras abu-abu gelap solid)
            return (
              <div key={idx} className="flex w-full justify-end">
                <div className="max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 bg-slate-900 text-white shadow-2xs text-sm md:text-base font-medium rounded-tr-none">
                  <div className="leading-relaxed">{renderMessageText(msg.text)}</div>
                  <span className="block text-right text-[9px] mt-1 font-bold text-slate-400">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          } else {
            // Tampilan Pesan AI (Dengan Avatar Customer Service di Kiri, Balon Putih Clean)
            return (
              <div key={idx} className="flex w-full justify-start items-start gap-2.5">
                {/* Avatar AI Customer Service */}
                <div className="w-8 h-8 rounded-full bg-civic-primary text-white flex items-center justify-center shrink-0 shadow-3xs select-none mt-0.5">
                  <Bot size={16} />
                </div>
                
                {/* Balon Pesan AI */}
                <div className="max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 bg-white text-slate-800 border border-slate-100 shadow-3xs text-sm md:text-base font-medium rounded-tl-none">
                  <div className="leading-relaxed">{renderMessageText(msg.text)}</div>
                  <span className="block text-left text-[9px] mt-1 font-bold text-slate-400">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          }
        })}

        {/* Loading Spinner */}
        {isTyping && (
          <div className="flex justify-start items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-civic-primary text-white flex items-center justify-center shrink-0 shadow-3xs select-none mt-0.5">
              <Bot size={16} />
            </div>
            <div className="bg-white text-slate-650 border border-slate-105 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 shadow-3xs">
              <Loader2 size={14} className="text-civic-primary animate-spin" />
              <span className="text-[11px] font-extrabold text-slate-500">Asisten sedang mengetik...</span>
            </div>
          </div>
        )}


      </div>

      {/* 3. Panel Pertanyaan Populer (Saran Pintar, Lebih ke bawah & hemat ruang) */}
      <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-150 flex flex-wrap gap-1.5 items-center justify-center shrink-0">
        <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle size={10} />
          Pertanyaan Warga:
        </span>
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={isTyping}
            onClick={() => handleSuggestionClick(q)}
            className="bg-white border border-slate-200 hover:border-teal-650 text-slate-700 hover:text-teal-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-3xs select-none"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 4. Form Input Pertanyaan Warga (Lebih Rapi & Rapat) */}
      <form onSubmit={handleSend} autoComplete="off" className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          placeholder={isTyping ? 'Harap tunggu asisten selesai menjawab...' : 'Ketik pertanyaan Anda di sini...'}
          className="flex-1 border border-slate-250 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-civic-primary text-sm md:text-base disabled:bg-slate-50 bg-slate-100"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-civic-primary text-white p-2.5 rounded-xl hover:bg-teal-800 disabled:bg-slate-200 transition-all flex items-center justify-center shrink-0 min-w-[44px] cursor-pointer"
          aria-label="Kirim Obrolan"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
