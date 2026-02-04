import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ShoppingBasket, 
  Wallet, 
  Info, 
  Zap, 
  RotateCcw, 
  LineChart, 
  Layout, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldAlert, 
  Ban, 
  Github 
} from 'lucide-react';

/**
 * Angebot & Nachfrage Lern-App
 * Optimiert für Mobile UX & Vercel Deployment
 */
const App = () => {
  const [angebot, setAngebot] = useState(50);
  const [nachfrage, setNachfrage] = useState(50);
  const [preis, setPreis] = useState(1);
  const [status, setStatus] = useState('gleichgewicht');
  const [szenarioText, setSzenarioText] = useState('Marktgleichgewicht – Angebot und Nachfrage halten sich die Waage.');
  const [viewMode, setViewMode] = useState('visual'); 
  
  const [interventionMode, setInterventionMode] = useState(null); 
  const [quizFeedback, setQuizFeedback] = useState(null); 
  const [currentQuiz, setCurrentQuiz] = useState(0);

  const quizFragen = [
    {
      frage: "Die Produktionskosten sinken durch neue Technik. Was passiert mit dem Angebot?",
      korrekt: "steigt",
      zielA: 85,
      zielN: 50,
      erklaerung: "Richtig! Günstigere Produktion führt zu einem höheren Angebot."
    },
    {
      frage: "Ein Produkt wird plötzlich zum absoluten Trend auf TikTok. Die Nachfrage...",
      korrekt: "steigt",
      zielA: 50,
      zielN: 90,
      erklaerung: "Genau! Ein Hype treibt die Nachfrage steil nach oben."
    },
    {
      frage: "Eine neue Steuer macht die Herstellung teurer. Das Angebot...",
      korrekt: "sinkt",
      zielA: 20,
      zielN: 50,
      erklaerung: "Richtig. Höhere Kosten verringern die angebotene Menge."
    }
  ];

  useEffect(() => {
    const berechneterPreis = angebot === 0 ? (nachfrage * 2).toFixed(2) : (nachfrage / angebot).toFixed(2);
    
    if (interventionMode === 'mindestpreis') {
      const pMin = (parseFloat(berechneterPreis) * 1.5).toFixed(2);
      setPreis(pMin);
      setStatus('angebotsueberhang');
    } else if (interventionMode === 'hoechstpreis') {
      const pMax = (parseFloat(berechneterPreis) * 0.6).toFixed(2);
      setPreis(pMax);
      setStatus('nachfrageueberhang');
    } else {
      setPreis(berechneterPreis);
      if (nachfrage > angebot) {
        setStatus('nachfrageueberhang');
      } else if (angebot > nachfrage) {
        setStatus('angebotsueberhang');
      } else {
        setStatus('gleichgewicht');
      }
    }
  }, [angebot, nachfrage, interventionMode]);

  const handleSzenario = (a, n, text) => {
    setAngebot(a);
    setNachfrage(n);
    setSzenarioText(text);
    setQuizFeedback(null);
    setInterventionMode(null);
  };

  const toggleIntervention = (mode) => {
    setInterventionMode(prev => prev === mode ? null : mode);
    setSzenarioText("");
  };

  const checkAnswer = (antwort) => {
    const frage = quizFragen[currentQuiz];
    if (antwort === frage.korrekt) {
      setQuizFeedback('correct');
      setAngebot(frage.zielA);
      setNachfrage(frage.zielN);
      setSzenarioText(frage.erklaerung);
      setInterventionMode(null);
    } else {
      setQuizFeedback('wrong');
    }
  };

  const nextQuiz = () => {
    setQuizFeedback(null);
    setCurrentQuiz((prev) => (prev + 1) % quizFragen.length);
  };

  const resetAll = () => {
    setAngebot(50);
    setNachfrage(50);
    setInterventionMode(null);
    setQuizFeedback(null);
    setSzenarioText("Markt im Gleichgewicht wiederhergestellt.");
  };

  const getGraphCoords = () => {
    const padding = 25; // Erhöht für bessere Sichtbarkeit der Achsenbeschriftung
    const size = 175;
    
    const nOffset = (nachfrage - 50) * 0.7;
    const nLine = { x1: padding, y1: padding - nOffset, x2: size, y2: size - nOffset };
    
    const aOffset = (angebot - 50) * 0.7;
    const aLine = { x1: padding, y1: size + aOffset, x2: size, y2: padding + aOffset };

    const interX = (size + padding) / 2 + (nachfrage - angebot) * 0.5;
    const interY = (size + padding) / 2 - (nachfrage + angebot - 100) * 0.25;

    let pFixY = interY;
    if (interventionMode === 'mindestpreis') pFixY = interY - 30; 
    if (interventionMode === 'hoechstpreis') pFixY = interY + 30; 

    const nXAtPFix = interX + (pFixY - interY); 
    const aXAtPFix = interX - (pFixY - interY);

    return { nLine, aLine, interX, interY, pFixY, nXAtPFix, aXAtPFix };
  };

  const { nLine, aLine, interX, interY, pFixY, nXAtPFix, aXAtPFix } = getGraphCoords();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800 flex flex-col items-center">
      <style>{`
        .graph-line { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .graph-point { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        /* Größere Touch-Bereiche für Slider */
        input[type=range]::-webkit-slider-runnable-track { min-height: 44px; display: flex; align-items: center; }
        input[type=range]::-moz-range-track { min-height: 44px; display: flex; align-items: center; }
        input[type=range] { height: 44px; background: transparent; }
      `}</style>

      <header className="w-full max-w-6xl mb-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">Markt-Labor</h1>
          <p className="text-slate-500 font-medium">Angebot & Nachfrage interaktiv verstehen</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto">
          <button 
            onClick={() => setViewMode('visual')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'visual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Layout size={18} /> Simulation
          </button>
          <button 
            onClick={() => setViewMode('graph')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'graph' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LineChart size={18} /> Graph
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 flex-grow">
        
        <div className="space-y-6">
          {/* Slider Sektion - Optimiert für Touch */}
          <section className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Info size={20} className="text-indigo-500" /> Markt-Parameter
            </h2>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-700 flex items-center gap-2">🍎 Angebot</label>
                <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl font-black text-lg">{angebot}</span>
              </div>
              <div className="relative h-11 flex items-center">
                <input
                  type="range" min="1" max="100" value={angebot}
                  onChange={(e) => { setAngebot(parseInt(e.target.value)); setSzenarioText(""); setQuizFeedback(null); }}
                  className="w-full bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500 h-2"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-700 flex items-center gap-2">💰 Nachfrage</label>
                <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-xl font-black text-lg">{nachfrage}</span>
              </div>
              <div className="relative h-11 flex items-center">
                <input
                  type="range" min="0" max="100" value={nachfrage}
                  onChange={(e) => { setNachfrage(parseInt(e.target.value)); setSzenarioText(""); setQuizFeedback(null); }}
                  className="w-full bg-slate-100 rounded-full appearance-none cursor-pointer accent-amber-500 h-2"
                />
              </div>
            </div>
          </section>

          {/* Szenarien */}
          <section className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><Zap size={20} className="text-orange-500" /> Schnell-Szenarien</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleSzenario(15, 50, "Knappheit! Eine Missernte reduziert das Angebot.")} className="p-4 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-2xl text-xs font-bold text-rose-700 text-left flex flex-col gap-1 transition-all active:scale-95">
                <span className="text-lg">🌾</span> Missernte
              </button>
              <button onClick={() => handleSzenario(50, 95, "Ein Social-Media-Hype treibt die Nachfrage extrem an.")} className="p-4 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-2xl text-xs font-bold text-sky-700 text-left flex flex-col gap-1 transition-all active:scale-95">
                <span className="text-lg">🔥</span> Trend-Hype
              </button>
              <button onClick={() => handleSzenario(95, 20, "Überproduktion! Die Lager sind voll, kaum Käufer.")} className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-2xl text-xs font-bold text-orange-700 text-left flex flex-col gap-1 transition-all active:scale-95">
                <span className="text-lg">🏭</span> Überfluss
              </button>
              <button onClick={resetAll} className="p-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-all active:scale-95">
                <RotateCcw size={20} /> Reset
              </button>
            </div>
          </section>

          {/* Staatliche Intervention */}
          <section className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-700">
              <ShieldAlert size={20} className="text-rose-500" /> Markt-Eingriff
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => toggleIntervention('mindestpreis')}
                className={`p-4 rounded-2xl font-bold flex flex-col items-center gap-2 border-2 transition-all active:scale-95 ${interventionMode === 'mindestpreis' ? 'bg-rose-600 border-rose-700 text-white shadow-lg' : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'}`}
              >
                <ArrowUp size={20} />
                <span className="text-xs">Mindestpreis</span>
              </button>
              <button 
                onClick={() => toggleIntervention('hoechstpreis')}
                className={`p-4 rounded-2xl font-bold flex flex-col items-center gap-2 border-2 transition-all active:scale-95 ${interventionMode === 'hoechstpreis' ? 'bg-sky-600 border-sky-700 text-white shadow-lg' : 'bg-sky-50 border-sky-100 text-sky-700 hover:bg-sky-100'}`}
              >
                <ArrowDown size={20} />
                <span className="text-xs">Höchstpreis</span>
              </button>
            </div>
          </section>

          {/* Quiz - Mobile Optimiert */}
          <section className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-indigo-400" /> Challenge
            </h2>
            <p className="text-base mb-6 text-slate-300 leading-relaxed font-medium">{quizFragen[currentQuiz].frage}</p>
            
            <div className="flex flex-col gap-3 mb-4">
              <button 
                disabled={quizFeedback === 'correct'}
                onClick={() => checkAnswer('steigt')}
                className={`w-full py-4 px-6 rounded-2xl font-black text-lg transition-all active:scale-95 ${quizFeedback === 'correct' ? 'bg-slate-800 opacity-50 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'}`}
              >
                Steigt
              </button>
              <button 
                disabled={quizFeedback === 'correct'}
                onClick={() => checkAnswer('sinkt')}
                className={`w-full py-4 px-6 rounded-2xl font-black text-lg transition-all active:scale-95 ${quizFeedback === 'correct' ? 'bg-slate-800 opacity-50 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'}`}
              >
                Sinkt
              </button>
            </div>

            {quizFeedback && (
              <div className={`flex items-center gap-4 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-4 ${quizFeedback === 'correct' ? 'bg-emerald-900/50 border border-emerald-500' : 'bg-rose-900/50 border border-rose-500'}`}>
                {quizFeedback === 'correct' ? <CheckCircle2 className="text-emerald-400 shrink-0" size={24} /> : <XCircle className="text-rose-400 shrink-0" size={24} />}
                <div className="flex-1">
                  <p className="text-sm font-bold">{quizFeedback === 'correct' ? 'Hervorragend!' : 'Versuch es nochmal'}</p>
                  {quizFeedback === 'correct' && (
                    <button onClick={nextQuiz} className="text-xs text-emerald-400 underline font-bold mt-1">Nächste Challenge</button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Rechte Spalte: Output */}
        <section className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center">
          <div className="w-full mb-8 relative">
             <div className="absolute -top-2 right-0 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500">
               {interventionMode ? "Kontrollpreis" : (parseFloat(preis) > 1 ? "Verkäufermarkt" : parseFloat(preis) < 1 ? "Käufermarkt" : "Gleichgewicht")}
             </div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black text-center mb-2">
              Marktpreis aktuell
            </div>
            <div className={`text-5xl md:text-7xl font-black text-center transition-colors duration-700 tracking-tighter ${interventionMode === 'mindestpreis' ? 'text-rose-600' : interventionMode === 'hoechstpreis' ? 'text-sky-600' : 'text-indigo-600'}`}>
              {preis} €
            </div>
          </div>

          <div className={`w-full p-5 mb-8 rounded-3xl border-2 text-center text-base font-bold min-h-[80px] flex items-center justify-center transition-all duration-500 shadow-sm ${interventionMode ? 'bg-rose-50 border-rose-200 text-rose-900' : status === 'nachfrageueberhang' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : status === 'angebotsueberhang' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
            {interventionMode ? (
              <div className="flex items-center gap-3">
                <Ban size={24} className="shrink-0 text-rose-600" />
                <span className="leading-tight">Marktstörung: {interventionMode === 'mindestpreis' ? 'Angebotsüberschuss' : 'Versorgungsengpass'}.</span>
              </div>
            ) : (
              <span className="leading-snug px-2">{szenarioText || (status === 'gleichgewicht' ? "Der Markt ist im stabilen Gleichgewicht." : status === 'nachfrageueberhang' ? "Nachfrageüberschuss: Preise steigen." : "Angebotsüberschuss: Preise sinken.")}</span>
            )}
          </div>

          <div className="w-full bg-slate-50 rounded-[2.5rem] p-4 flex items-center justify-center min-h-[340px] md:min-h-[420px] border border-slate-100 relative overflow-hidden shadow-inner">
            {viewMode === 'visual' ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 text-center">
                {interventionMode === 'mindestpreis' && <div className="text-rose-600 font-black text-4xl mb-6 animate-pulse tracking-tighter">ÜBERFLUSS</div>}
                {interventionMode === 'hoechstpreis' && <div className="text-sky-600 font-black text-4xl mb-6 animate-pulse tracking-tighter">MANGEL</div>}
                {!interventionMode && (
                  <>
                    {status === 'nachfrageueberhang' && <ArrowUp size={120} className="text-emerald-500 animate-bounce" />}
                    {status === 'angebotsueberhang' && <ArrowDown size={120} className="text-rose-500 animate-bounce" />}
                    {status === 'gleichgewicht' && (
                      <div className="py-12 flex flex-col items-center">
                        <div className="w-32 h-2.5 bg-slate-300 rounded-full relative">
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-1.5 h-14 bg-slate-500 rounded-full"></div>
                        </div>
                        <span className="mt-10 text-indigo-600 font-black tracking-[0.3em] uppercase text-xl">Balance</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500">
                <svg viewBox="0 0 200 200" className="w-full h-auto max-w-[320px] overflow-visible drop-shadow-sm">
                  <line x1="25" y1="20" x2="25" y2="180" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrowhead)" />
                  <line x1="25" y1="180" x2="185" y2="180" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrowhead)" />
                  <text x="10" y="15" fontSize="10" fill="#94a3b8" fontWeight="900">P</text>
                  <text x="180" y="195" fontSize="10" fill="#94a3b8" fontWeight="900">M</text>

                  <line className="graph-line" x1={nLine.x1} y1={nLine.y1} x2={nLine.x2} y2={nLine.y2} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                  <text className="graph-line" x={nLine.x2 + 8} y={nLine.y2 + 4} fontSize="12" fill="#f59e0b" fontWeight="900">N</text>

                  <line className="graph-line" x1={aLine.x1} y1={aLine.y1} x2={aLine.x2} y2={aLine.y2} stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                  <text className="graph-line" x={aLine.x2 + 8} y={aLine.y2 + 4} fontSize="12" fill="#10b981" fontWeight="900">A</text>

                  {interventionMode && (
                    <g>
                      <rect 
                        className="graph-line"
                        x={Math.min(nXAtPFix, aXAtPFix)} 
                        y={pFixY - 3} 
                        width={Math.max(5, Math.abs(nXAtPFix - aXAtPFix))} 
                        height="6" 
                        rx="3"
                        fill={interventionMode === 'mindestpreis' ? '#f43f5e' : '#0ea5e9'} 
                        opacity="0.3"
                      />
                      <line x1="25" y1={pFixY} x2="185" y2={pFixY} stroke={interventionMode === 'mindestpreis' ? '#f43f5e' : '#0ea5e9'} strokeWidth="2" strokeDasharray="4 4" />
                    </g>
                  )}

                  <g className="graph-point">
                    <circle cx={interX} cy={interY} r="6" fill="#1e293b" stroke="white" strokeWidth="2" />
                    {!interventionMode && (
                      <>
                        <line x1="25" y1={interY} x2={interX} y2={interY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
                        <line x1={interX} y1={interY} x2={interX} y2={180} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
                      </>
                    )}
                  </g>

                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                    </marker>
                  </defs>
                </svg>
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-emerald-600"><span className="w-4 h-1.5 bg-emerald-500 rounded-full"></span> Angebot</span>
                  <span className="flex items-center gap-2 text-amber-600"><span className="w-4 h-1.5 bg-amber-500 rounded-full"></span> Nachfrage</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-[1.5rem] bg-emerald-50 border border-emerald-100 flex flex-col items-center gap-2 shadow-sm">
              <ShoppingBasket size={24} className="text-emerald-600" />
              <div className="text-center">
                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mb-1">Menge</div>
                <div className="font-black text-lg text-emerald-900">{angebot} Stk.</div>
              </div>
            </div>
            <div className="p-4 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex flex-col items-center gap-2 shadow-sm">
              <Wallet size={24} className="text-amber-600" />
              <div className="text-center">
                <div className="text-[10px] text-amber-600 font-black uppercase tracking-wider mb-1">Kunden</div>
                <div className="font-black text-lg text-amber-900">{nachfrage} P.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full max-w-6xl mt-12 mb-8 py-8 border-t border-slate-200 flex flex-col items-center gap-4">
        <div className="text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] text-center">
          Digitale Lerneinheit: Markt & Preisbildung
        </div>
        <a 
          href="https://github.com/mariusskroce" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100 transition-all text-sm font-black group"
        >
          <Github size={20} className="group-hover:rotate-12 transition-transform" />
          erstellt von @mariusskroce
        </a>
      </footer>
    </div>
  );
};

export default App;