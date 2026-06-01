import { useState, useEffect, useRef } from 'react';

const TIMER_DURATION = 15;
const LABELS = ['A', 'B', 'C', 'D'];

// ============================================================
// HELPER
// ============================================================
function getRating(score, total) {
  if (total === 0) return { stars: 1, msg: "Memuat kuis...", color: "text-gray-400" };
  const pct = score / (total * 2); // bonus points possible
  if (pct >= 0.8) return { stars: 5, msg: "SEMPURNA! Kamu petani jenius! 🏆", color: "text-yellow-400" };
  if (pct >= 0.6) return { stars: 4, msg: "Luar biasa! Hampir sempurna! 🌟", color: "text-green-400" };
  if (pct >= 0.4) return { stars: 3, msg: "Bagus! Terus berlatih! 💪", color: "text-blue-400" };
  if (pct >= 0.2) return { stars: 2, msg: "Lumayan! Masih bisa lebih baik 🌱", color: "text-orange-400" };
  return { stars: 1, msg: "Jangan menyerah, coba lagi! 🔄", color: "text-red-400" };
}

// ============================================================
// COMPONENTS
// ============================================================
function StarRating({ stars }) {
  return (
    <div className="flex justify-center gap-2 my-4">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-4xl transition-all duration-300 ${i <= stars ? 'opacity-100 scale-110' : 'opacity-20'}`}
          style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
      ))}
    </div>
  );
}

function TimerRing({ timeLeft, total }) {
  const pct = timeLeft / total;
  const r = 28, circ = 2 * Math.PI * r;
  const color = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171';
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute -rotate-90" width="72" height="72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1f2937" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
      </svg>
      <span className="text-xl font-black text-white z-10">{timeLeft}</span>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [matchingData, setMatchingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [gameState, setGameState] = useState('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [showStreak, setShowStreak] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Matching
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selectedQ, setSelectedQ] = useState(null);
  const [matches, setMatches] = useState({});
  const [isChecking, setIsChecking] = useState(false);

  const timerRef = useRef(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/generate-quiz');
      if (!res.ok) throw new Error('Gagal mengambil data kuis');
      const data = await res.json();
      
      setQuestions(data);
      
      // Generate matching data from questions
      const matching = data.map((q, idx) => ({
        q: q.q,
        a: q.a[q.correct],
        id: idx
      }));
      setMatchingData(matching);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'quiz' || isAnswering) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, currentIdx, isAnswering]);

  const handleTimeout = () => {
    setIsAnswering(true);
    setSelectedAns(-1);
    setStreak(0);
    setTimeout(nextQuestion, 1800);
  };

  const nextQuestion = () => {
    setCurrentIdx(c => {
      const next = c + 1;
      if (next >= questions.length) {
        setGameState('result');
      } else {
        setAnimKey(k => k + 1);
        setSelectedAns(null);
        setIsAnswering(false);
        setTimeLeft(TIMER_DURATION);
      }
      return next;
    });
  };

  const handleAnswer = (idx) => {
    if (isAnswering) return;
    clearInterval(timerRef.current);
    setIsAnswering(true);
    setSelectedAns(idx);

    const correct = idx === questions[currentIdx].correct;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = newStreak >= 3 ? 2 : 1;
      setScore(s => s + bonus);
      if (newStreak >= 3) { setShowStreak(true); setTimeout(() => setShowStreak(false), 1200); }
    } else {
      setStreak(0);
    }
    setTimeout(nextQuestion, 1600);
  };

  const startQuiz = () => {
    if (questions.length === 0) {
      fetchQuestions();
    }
    setGameState('quiz');
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedAns(null);
    setIsAnswering(false);
    setTimeLeft(TIMER_DURATION);
    setAnimKey(0);
  };

  const startMatching = () => {
    const answers = matchingData.map(item => ({ text: item.a, id: item.id }));
    setShuffledAnswers([...answers].sort(() => Math.random() - 0.5));
    setMatches({});
    setSelectedQ(null);
    setIsChecking(false);
    setGameState('matching');
  };

  const playAgain = () => {
    fetchQuestions();
    setGameState('start');
  }

  const rating = getRating(score, questions.length);
  const q = questions[Math.min(currentIdx, questions.length - 1)];

  return (
    <main className="container mx-auto px-4 py-12">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes streakPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .slide-up { animation: slideUp 0.4s ease-out forwards; }
        .pop-in { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .streak-pop { animation: streakPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .shake { animation: shake 0.4s ease; }
      `}</style>

      {/* Hero */}
      <section className="text-center mb-10">
        <div className="bg-black/40 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-green-500/20">
          <h1 className="text-4xl md:text-5xl font-bold text-white">🎮 Quiz & Tantangan <span className="text-green-400">AgriLens</span></h1>
          <p className="mt-3 text-gray-300">Uji pengetahuanmu seputar pertanian dan raih skor tertinggi!</p>
        </div>
      </section>

      <div className={`mx-auto bg-black/60 border border-green-500/40 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${gameState === 'matching' ? 'max-w-4xl' : 'max-w-2xl'}`}>

        {/* ── START SCREEN ── */}
        {gameState === 'start' && (
          <div className="p-10 text-center slide-up">
            <div className="text-8xl mb-6">🌾</div>
            <h2 className="text-3xl font-black text-white mb-3">Siap Bertanding?</h2>
            
            {loading ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Menyiapkan soal kuis dari AI...</p>
              </div>
            ) : error ? (
              <div className="py-10">
                <p className="text-red-400 mb-4">❌ {error}</p>
                <button onClick={fetchQuestions} className="text-green-400 font-bold underline">Coba Lagi</button>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-2">Jawab <span className="text-green-400 font-bold">{questions.length} soal</span> dengan benar secepat mungkin!</p>
                <p className="text-gray-500 text-sm mb-8">⏱ Setiap soal punya waktu <strong className="text-yellow-400">{TIMER_DURATION} detik</strong> · 🔥 Jawab beruntun = bonus poin!</p>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[['⏱', 'Timer', `${TIMER_DURATION}s / soal`], ['🔥', 'Streak', 'Bonus x2'], ['⭐', 'Rating', '5 bintang']].map(([icon, label, val]) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-3xl mb-1">{icon}</div>
                      <div className="text-white font-bold text-sm">{label}</div>
                      <div className="text-gray-400 text-xs">{val}</div>
                    </div>
                  ))}
                </div>

                <button onClick={startQuiz}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl text-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-green-500/30">
                  Mulai Kuis! 🚀
                </button>
              </>
            )}
          </div>
        )}

        {/* ── QUIZ SCREEN ── */}
        {gameState === 'quiz' && currentIdx < questions.length && (
          <div key={animKey} className="p-8 slide-up relative">

            {/* Streak popup */}
            {showStreak && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 streak-pop bg-orange-500 text-white font-black px-6 py-3 rounded-2xl text-lg shadow-xl">
                🔥 {streak} STREAK! +2 POIN!
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm font-bold">{currentIdx + 1} / {questions.length}</span>
                {streak >= 2 && (
                  <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold px-3 py-1 rounded-full">
                    🔥 {streak} streak
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl">
                  <span className="text-green-400 font-black text-lg">{score}</span>
                  <span className="text-gray-500 text-xs ml-1">pts</span>
                </div>
                <TimerRing timeLeft={timeLeft} total={TIMER_DURATION} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIdx) / questions.length) * 100}%` }} />
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <span className="text-5xl">{q.emoji}</span>
              <h3 className="text-xl md:text-2xl font-bold text-white mt-4 leading-relaxed">{q.q}</h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {q.a.map((ans, i) => {
                const isCorrect = i === q.correct;
                const isSelected = i === selectedAns;
                const isTimeout = selectedAns === -1;

                let cls = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-green-500/50 hover:scale-[1.02] cursor-pointer";
                if (isAnswering) {
                  if (isCorrect) cls = "bg-green-500/20 border-green-400 scale-[1.02]";
                  else if (isSelected && !isCorrect) cls = "bg-red-500/20 border-red-400 shake";
                  else cls = "bg-white/3 border-white/5 opacity-40";
                }

                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswering}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${cls}`}>
                    <span className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-sm
                      ${isAnswering && isCorrect ? 'bg-green-500 text-black' : isAnswering && isSelected && !isCorrect ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                      {LABELS[i]}
                    </span>
                    <span className="text-white font-medium">{ans}</span>
                    {isAnswering && isCorrect && <span className="ml-auto text-green-400 text-xl">✓</span>}
                    {isAnswering && isSelected && !isCorrect && <span className="ml-auto text-red-400 text-xl">✗</span>}
                  </button>
                );
              })}
            </div>

            {isAnswering && selectedAns === -1 && (
              <p className="text-center text-red-400 font-bold mt-4 animate-pulse">⏰ Waktu habis!</p>
            )}
          </div>
        )}

        {/* ── RESULT SCREEN ── */}
        {gameState === 'result' && (
          <div className="p-10 text-center slide-up">
            <div className="text-7xl mb-4 pop-in">{rating.stars === 5 ? '🏆' : rating.stars >= 4 ? '🎉' : rating.stars >= 3 ? '😊' : '💪'}</div>
            <h2 className="text-3xl font-black text-white mb-2">Kuis Selesai!</h2>
            <p className={`text-lg font-bold mb-4 ${rating.color}`}>{rating.msg}</p>

            <StarRating stars={rating.stars} />

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 mt-4">
              <div className="text-6xl font-black text-green-400 mb-1">{score}</div>
              <div className="text-gray-400 text-sm">dari maks. {questions.length * 2} poin</div>
              <div className="mt-3 text-gray-300 text-sm">Jawaban benar: <span className="text-white font-bold">{Math.min(score, questions.length)}</span> / {questions.length}</div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={startMatching}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-blue-500/20">
                🧠 Lanjut Game Pencocokan
              </button>
              <button onClick={playAgain}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all border border-white/10">
                🔄 Main Lagi
              </button>
            </div>
          </div>
        )}

        {/* ── MATCHING SCREEN ── */}
        {gameState === 'matching' && (
          <div className="p-8 slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white">🧩 Game Pencocokan</h2>
              <p className="text-gray-400 mt-2 text-sm">Pilih pertanyaan → lalu pilih jawaban yang tepat</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Questions */}
              <div className="space-y-3">
                <h3 className="text-green-400 font-black text-center text-sm uppercase tracking-widest mb-4">Pertanyaan</h3>
                {matchingData.map(item => {
                  const isMatched = matches[item.id] !== undefined;
                  const isCorrect = isChecking && matches[item.id] === item.id;
                  const isWrong = isChecking && isMatched && matches[item.id] !== item.id;
                  const isActive = selectedQ === item.id;

                  return (
                    <div key={item.id} onClick={() => !isChecking && setSelectedQ(item.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-sm font-medium leading-snug
                        ${isActive ? 'bg-green-500/20 border-green-400 scale-[1.02] text-white' :
                          isCorrect ? 'bg-green-500/15 border-green-500/60 text-green-300' :
                          isWrong ? 'bg-red-500/15 border-red-500/60 text-red-300' :
                          isMatched ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' :
                          'bg-white/5 border-white/10 text-gray-300 hover:border-green-500/40 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-2">
                        {isCorrect && <span className="text-green-400">✓</span>}
                        {isWrong && <span className="text-red-400">✗</span>}
                        {isMatched && !isChecking && <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 inline-block"></span>}
                        {item.q}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <h3 className="text-blue-400 font-black text-center text-sm uppercase tracking-widest mb-4">Jawaban</h3>
                {shuffledAnswers.map(item => {
                  const qId = parseInt(Object.keys(matches).find(k => matches[k] === item.id) ?? '-1');
                  const isMatched = qId !== -1;
                  const isCorrect = isChecking && qId === item.id;
                  const isWrong = isChecking && isMatched && qId !== item.id;

                  return (
                    <div key={item.id} onClick={() => selectedQ !== null && !isChecking && (() => {
                      setMatches(prev => ({ ...prev, [selectedQ]: item.id }));
                      setSelectedQ(null);
                    })()}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-sm font-medium leading-snug
                        ${isCorrect ? 'bg-green-500/15 border-green-500/60 text-green-300' :
                          isWrong ? 'bg-red-500/15 border-red-500/60 text-red-300' :
                          isMatched ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' :
                          selectedQ !== null ? 'bg-white/5 border-white/10 text-gray-300 hover:border-blue-400/60 hover:bg-blue-500/10 hover:scale-[1.02]' :
                          'bg-white/5 border-white/10 text-gray-400'}`}>
                      <div className="flex items-center gap-2">
                        {isCorrect && <span className="text-green-400">✓</span>}
                        {isWrong && <span className="text-red-400">✗</span>}
                        {item.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Result */}
            {isChecking && (
              <div className={`mt-6 p-4 rounded-2xl text-center font-bold text-lg
                ${Object.keys(matches).filter(k => matches[k] == k).length === matchingData.length
                  ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                  : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'}`}>
                {Object.keys(matches).filter(k => matches[k] == k).length === matchingData.length
                  ? "🎉 Sempurna! Semua cocok!"
                  : `✨ ${Object.keys(matches).filter(k => matches[k] == k).length} / ${matchingData.length} benar — coba lagi!`}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 justify-center">
              {!isChecking ? (
                <button onClick={() => setIsChecking(true)}
                  disabled={Object.keys(matches).length < matchingData.length}
                  className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 px-8 rounded-2xl transition-all hover:scale-105">
                  Cek Jawaban ✓
                </button>
              ) : (
                <button onClick={() => {
                  setMatches({}); setSelectedQ(null); setIsChecking(false);
                  setShuffledAnswers([...matchingData.map(i => ({ text: i.a, id: i.id }))].sort(() => Math.random() - 0.5));
                }} className="bg-white/10 hover:bg-white/20 text-white font-black py-3 px-8 rounded-2xl transition-all border border-white/10">
                  Main Lagi 🔄
                </button>
              )}
              <button onClick={() => setGameState('start')}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-300 font-black py-3 px-8 rounded-2xl transition-all border border-green-500/30">
                Menu Utama 🏠
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Quiz;