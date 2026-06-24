import React from 'react';
import { Award, Trash2, Plus, Check } from 'lucide-react';

interface QuizWidgetProps {
  isAdmin: boolean;
  currentUser: any;
  quizQuestions: any[];
  pointsPerQuestion: number;
  onAddQuizQuestion?: (question: string, options: Array<{ key: string; text: string }>, correctAnswer: string) => void;
  onDeleteQuizQuestion?: (id: number) => void;
  onUpdatePointsPerQuestion?: (points: number) => void;
  onUpdateCitizenPoints?: (userId: string, points: number) => void;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({
  isAdmin,
  currentUser,
  quizQuestions = [],
  pointsPerQuestion = 5,
  onAddQuizQuestion,
  onDeleteQuizQuestion,
  onUpdatePointsPerQuestion,
  onUpdateCitizenPoints,
}) => {
  // State Interactive Smart Quiz
  const [quizStep, setQuizStep] = React.useState<number>(0); // 0: start, 1: q1, 2: q2, ...
  const [quizAnswers, setQuizAnswers] = React.useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = React.useState<boolean>(false);
  const [quizScore, setQuizScore] = React.useState<number>(0);

  // Sync completed kuis status per user
  React.useEffect(() => {
    if (currentUser && currentUser !== 'admin') {
      const completed = localStorage.getItem(`civic_smart_quiz_completed_${currentUser.email}`) === 'true';
      setQuizCompleted(completed);
      setQuizStep(0);
      setQuizAnswers({});
      setQuizScore(0);
    } else {
      setQuizCompleted(false);
    }
  }, [currentUser]);

  return (
    <>
      {/* Smart Quiz Lingkungan Management (Admin Only) */}
      {isAdmin && (
        <div className="bg-civic-surface border border-slate-200 rounded-2xl p-5 shadow-xs mt-4 space-y-4">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 select-none">
            <Award size={16} className="text-amber-600 shrink-0" />
            Kelola Smart Quiz Lingkungan
          </h4>
          
          {/* Form Atur Poin per Soal */}
          <div className="space-y-2">
            <label htmlFor="pts-per-q" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Poin per Jawaban Benar:
            </label>
            <div className="flex gap-2">
              <input
                id="pts-per-q"
                type="number"
                min="1"
                value={pointsPerQuestion}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    onUpdatePointsPerQuestion?.(val);
                  }
                }}
                className="w-full border border-slate-350 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          
          {/* List Soal Saat Ini */}
          <div className="space-y-2 select-none">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Daftar Soal ({quizQuestions.length}):
            </span>
            {quizQuestions.length === 0 ? (
              <p className="text-xs text-slate-450 italic">Belum ada soal kuis.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1 relative text-xs">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-bold text-slate-800 leading-normal">{idx + 1}. {q.question}</p>
                      <button
                        onClick={() => {
                          if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
                            onDeleteQuizQuestion?.(q.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded shrink-0 cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="pl-3 text-[11px] text-slate-505 space-y-0.5">
                      {q.options.map((opt: any) => (
                        <p key={opt.key} className={q.correctAnswer === opt.key ? 'text-emerald-700 font-extrabold' : ''}>
                          {opt.key}. {opt.text}
                        </p>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-450 mt-1 font-bold">
                      Kunci: <span className="text-emerald-700">{q.correctAnswer}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Form Tambah Soal Baru */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const question = (form.elements.namedItem('q-text') as HTMLInputElement).value;
              const optA = (form.elements.namedItem('q-opt-a') as HTMLInputElement).value;
              const optB = (form.elements.namedItem('q-opt-b') as HTMLInputElement).value;
              const optC = (form.elements.namedItem('q-opt-c') as HTMLInputElement).value;
              const correct = (form.elements.namedItem('q-correct') as HTMLSelectElement).value;
              
              if (!question.trim() || !optA.trim() || !optB.trim() || !optC.trim()) {
                alert('Harap lengkapi pertanyaan dan semua opsi!');
                return;
              }
              
              onAddQuizQuestion?.(
                question.trim(),
                [
                  { key: 'A', text: optA.trim() },
                  { key: 'B', text: optB.trim() },
                  { key: 'C', text: optC.trim() }
                ],
                correct
              );
              
              form.reset();
            }}
            className="space-y-2 border-t border-slate-100 pt-3"
          >
            <span className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Tambah Soal Baru:
            </span>
            
            <input
              name="q-text"
              type="text"
              placeholder="Teks Pertanyaan"
              required
              className="w-full border border-slate-355 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            
            <div className="space-y-1.5 pl-2 border-l-2 border-amber-300">
              <input
                name="q-opt-a"
                type="text"
                placeholder="Opsi A"
                required
                className="w-full border border-slate-250 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              />
              <input
                name="q-opt-b"
                type="text"
                placeholder="Opsi B"
                required
                className="w-full border border-slate-250 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              />
              <input
                name="q-opt-c"
                type="text"
                placeholder="Opsi C"
                required
                className="w-full border border-slate-250 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <label htmlFor="q-correct" className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                Jawaban Benar:
              </label>
              <select
                id="q-correct"
                name="q-correct"
                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold py-2 px-3 rounded-lg cursor-pointer transition-colors shadow-3xs"
            >
              Tambah Soal Kuis
            </button>
          </form>
        </div>
      )}

      {/* Smart Quiz Lingkungan (Warga Only) */}
      {!isAdmin && (
        <div className="bg-civic-surface border border-slate-200 rounded-2xl p-5 shadow-xs mt-4">
          <h4 className="font-extrabold text-slate-805 text-xs uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 select-none">
            <Award size={16} className="text-amber-600 shrink-0" />
            Smart Quiz Lingkungan
          </h4>
          
          {quizQuestions.length === 0 ? (
            <div className="text-center py-4 space-y-2 select-none">
              <p className="text-xs text-slate-500 font-medium">
                Tidak ada pertanyaan kuis yang tersedia untuk saat ini.
              </p>
            </div>
          ) : quizCompleted ? (
            <div className="text-center py-4 space-y-2 select-none">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-3xs">
                <Check size={20} className="text-amber-600" />
              </div>
              <h5 className="font-bold text-slate-805 text-sm">Quiz Hari Ini Selesai!</h5>
              <p className="text-xs text-slate-500 font-medium">
                Terima kasih telah berpartisipasi menjaga kebersihan dan ketertiban. Poin partisipasi Anda telah disimpan.
              </p>
            </div>
          ) : quizStep === 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-505 leading-relaxed font-medium">
                Uji pengetahuan lingkungan Anda tentang pengelolaan sampah, jam tenang, dan kesehatan lingkungan untuk memenangkan +{quizQuestions.length * pointsPerQuestion} poin keaktifan warga!
              </p>
              <button
                onClick={() => {
                  setQuizStep(1);
                  setQuizAnswers({});
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl transition-all text-xs text-center cursor-pointer shadow-3xs"
              >
                Mulai Quiz Lingkungan
              </button>
            </div>
          ) : quizStep >= 1 && quizStep <= quizQuestions.length ? (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-455 font-extrabold select-none">
                <span>PERTANYAAN {quizStep} DARI {quizQuestions.length}</span>
                <span>{Math.round(((quizStep - 1) / quizQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${(quizStep / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Pertanyaan & Pilihan */}
              {(() => {
                const currentQ = quizQuestions[quizStep - 1];
                if (!currentQ) return null;
                return (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-800 leading-normal">
                      {quizStep}. {currentQ.question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {currentQ.options.map((opt: any) => (
                        <button
                          key={opt.key}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [quizStep]: opt.key }))}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            quizAnswers[quizStep] === opt.key
                              ? 'bg-amber-55 border-amber-500 text-amber-900 shadow-3xs'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700'
                          }`}
                        >
                          {opt.key}. {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Navigasi / Kirim */}
              <div className="flex gap-2 justify-end pt-1 select-none">
                {quizStep > 1 && (
                  <button
                    onClick={() => setQuizStep((prev) => prev - 1)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-655 text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                  >
                    Kembali
                  </button>
                )}
                <button
                  onClick={() => {
                    // Cek apakah sudah dijawab untuk step ini
                    if (!quizAnswers[quizStep]) {
                      alert('Harap pilih salah satu jawaban terlebih dahulu!');
                      return;
                    }
                    if (quizStep < quizQuestions.length) {
                      setQuizStep((prev) => prev + 1);
                    } else {
                      // Koreksi jawaban
                      let score = 0;
                      quizQuestions.forEach((q, idx) => {
                        if (quizAnswers[idx + 1] === q.correctAnswer) {
                          score++;
                        }
                      });
                      
                      setQuizScore(score);
                      setQuizStep(quizQuestions.length + 1);
                      
                      if (currentUser && currentUser.id) {
                        const newPointsEarned = score * pointsPerQuestion;
                        onUpdateCitizenPoints?.(currentUser.id, (currentUser.points ?? 0) + newPointsEarned);
                        setQuizCompleted(true);
                        localStorage.setItem(`civic_smart_quiz_completed_${currentUser.email}`, 'true');
                        alert(`Luar biasa! Kuis selesai. Anda menjawab ${score} dari ${quizQuestions.length} dengan benar dan memenangkan +${newPointsEarned} poin partisipasi warga!`);
                      }
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                >
                  {quizStep === quizQuestions.length ? 'Kirim Jawaban' : 'Selanjutnya'}
                </button>
              </div>
            </div>
          ) : (
            /* score card view */
            <div className="text-center py-2 space-y-3 select-none">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-3xs">
                <Check size={20} className="text-amber-600" />
              </div>
              <h5 className="font-bold text-slate-805 text-sm">Skor Anda: {quizScore} / {quizQuestions.length}</h5>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Anda berhasil menjawab {quizScore} pertanyaan dengan benar dan mendapatkan +{quizScore * pointsPerQuestion} poin!
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
