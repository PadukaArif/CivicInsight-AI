import React from 'react';
import { ChatMessage } from '../../types';
import { Bot, Send, HelpCircle, Loader2 } from 'lucide-react';

export interface EvaluasiAIViewProps {
  chatMessages: ChatMessage[];
  onSendChatMessage: (text: string) => void;
  isTyping: boolean;
}

export const EvaluasiAIView: React.FC<EvaluasiAIViewProps> = ({
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
                    className="text-blue-600 hover:text-blue-800 underline font-bold break-all"
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

  // Auto-scroll chat container on messages update
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
    <div className="bg-civic-surface rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-8.5rem)] min-h-[420px] overflow-hidden">
      
      {/* 1. Header Chat */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-xs shrink-0">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">Asisten Evaluasi AI</h3>
            <p className="text-[10px] text-slate-455 font-bold leading-none mt-0.5">Analisis Kinerja Layanan Publik & Data Bulanan</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[9px] font-extrabold text-blue-800 uppercase tracking-wider">Model Siap</span>
        </div>
      </div>

      {/* 2. Messages List */}
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
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-3xs select-none mt-0.5">
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
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-3xs select-none mt-0.5">
              <Bot size={16} />
            </div>
            <div className="bg-white text-slate-650 border border-slate-105 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 shadow-3xs">
              <Loader2 size={14} className="text-blue-600 animate-spin" />
              <span className="text-[11px] font-extrabold text-slate-500">Menganalisis data layanan...</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Pre-set suggestions */}
      <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-150 flex flex-wrap gap-1.5 items-center justify-center shrink-0">
        <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle size={10} />
          Evaluasi Pintar:
        </span>
        <button
          type="button"
          disabled={isTyping}
          onClick={() => handleSuggestionClick('Tampilkan ringkasan aduan warga bulan ini')}
          className="bg-white border border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs select-none"
        >
          Ringkasan Aduan
        </button>
        <button
          type="button"
          disabled={isTyping}
          onClick={() => handleSuggestionClick('Bagaimana evaluasi keuangan kas RT saat ini?')}
          className="bg-white border border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs select-none"
        >
          Evaluasi Keuangan Kas
        </button>
        <button
          type="button"
          disabled={isTyping}
          onClick={() => handleSuggestionClick('Tampilkan data pekerjaan warga & resiko kemiskinan')}
          className="bg-white border border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs select-none"
        >
          Data Pekerjaan Warga
        </button>
        <button
          type="button"
          disabled={isTyping}
          onClick={() => handleSuggestionClick('Analisis survei kenyamanan lingkungan warga')}
          className="bg-white border border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-900 text-[10px] font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs select-none"
        >
          Survei Lingkungan
        </button>
      </div>

      {/* 4. Form Input */}
      <form onSubmit={handleSend} autoComplete="off" className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          placeholder={isTyping ? 'Harap tunggu asisten selesai menganalisis...' : 'Ketik pertanyaan evaluasi layanan di sini...'}
          className="flex-1 border border-slate-250 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm disabled:bg-slate-50 bg-slate-100"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:bg-slate-200 transition-all flex items-center justify-center shrink-0 min-w-[44px] cursor-pointer"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
