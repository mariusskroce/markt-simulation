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
 * Vollständig Responsive & Vercel Optimized
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
  const padding = 25;
  const size = 175;
  const originX = padding; // Für die Achsen-Referenz
  const originY = size;    // Für die Achsen-Referenz
  const maxX = size;
  const minY = padding;

  // Skalierungsfaktor für die Verschiebung
  const s = 0.7; 
  
  // Nachfrage (fällt: x steigt -> y steigt im SVG-Koordinatensystem)
  const nOffset = (nachfrage - 50) * s;
  const nLine = { 
    x1: padding, 
    y1: padding - nOffset, 
    x2: size, 
    y2: size - nOffset 
  };

  // Angebot (steigt: x steigt -> y sinkt im SVG-Koordinatensystem)
  const aOffset = (angebot - 50) * s;
  const aLine = { 
    x1: padding, 
    y1: size + aOffset, 
    x2: size, 
    y2: padding + aOffset 
  };

  /**
   * Die exakte Schnittpunkt-Logik:
   * interX: Die Mitte plus die Differenz der Verschiebungen (halbiert)
   * interY: Die Mitte minus die Summe der Verschiebungen (halbiert)
   */
  const interX = (size + padding) / 2 + (nachfrage - angebot) * (s / 2);
  const interY = (size + padding) / 2 - (nachfrage + angebot - 100) * (s / 2);

  // Interventionen
  let pFixY = interY;
  if (interventionMode === 'mindestpreis') pFixY = interY - 30; 
  if (interventionMode === 'hoechstpreis') pFixY = interY + 30; 

  // Bei 45° Steigung ist die horizontale Abweichung (X) 
  // identisch mit der vertikalen Abweichung (Y) vom Schnittpunkt
  const dist = pFixY - interY;
  const nXAtPFix = interX + dist; 
  const aXAtPFix = interX - dist;

  return { 
    nLine, aLine, interX, interY, pFixY, nXAtPFix, aXAtPFix, 
    originX, originY, maxX, minY 
  };
};

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-8 font-sans text-slate-800 flex flex-col items-center">
      <style>{`
        .graph-line { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .graph-point { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        input[type=range]::-webkit-slider-runnable-track { min-height: 36px; display: flex; align-items: center; }
        input[type=range]::-moz-range-track { min-height: 36px; display: flex; align-items: center; }
        input[type=range] { height: 36px; background: transparent; }
      `}</style>

      {/* Header - Kompakter für Mobile */}
      <header className="w-full max-w-6xl mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Markt-Labor</h1>
          <p className="text-slate-500 font-medium text-sm">Angebot & Nachfrage interaktiv verstehen</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto">
          <button 
            onClick={() => setViewMode('visual')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'visual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Layout size={16} /> Simulation
          </button>
          <button 
            onClick={() => setViewMode('graph')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'graph' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LineChart size={16} /> Graph
          </button>
        </div>
      </header>

      {/* Main Grid: Mobile einspaltig (Output oben), Desktop zweispaltig (Output rechts) */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* RECHTE SPALTE (In Mobile oben durch 'order-first') */}
        <div className="lg:order-2 lg:sticky lg:top-8 space-y-6 order-first">
          <section className="bg-white p-5 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center">
            <div className="w-full mb-6 relative">
               <div className="absolute -top-2 right-0 bg-slate-100 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-slate-500">
                 {interventionMode ? "Kontrollpreis" : (parseFloat(preis) > 1 ? "Verkäufermarkt" : parseFloat(preis) < 1 ? "Käufermarkt" : "Gleichgewicht")}
               </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center mb-1">
                Marktpreis aktuell
              </div>
              <div className={`text-5xl md:text-7xl font-black text-center transition-colors duration-700 tracking-tighter ${interventionMode === 'mindestpreis' ? 'text-rose-600' : interventionMode === 'hoechstpreis' ? 'text-sky-600' : 'text-indigo-600'}`}>
                {preis} €
              </div>
            </div>

            <div className={`w-full p-4 mb-6 rounded-2xl border-2 text-center text-sm font-bold min-h-[70px] flex items-center justify-center transition-all duration-500 ${interventionMode ? 'bg-rose-50 border-rose-200 text-rose-900' : status === 'nachfrageueberhang' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : status === 'angebotsueberhang' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
              {interventionMode ? (
                <div className="flex items-center gap-2">
                  <Ban size={20} className="shrink-0 text-rose-600" />
                  <span className="leading-tight">Marktstörung: {interventionMode === 'mindestpreis' ? 'Angebotsüberschuss' : 'Versorgungsengpass'}.</span>
                </div>
              ) : (
                <span className="leading-snug">{szenarioText || (status === 'gleichgewicht' ? "Der Markt ist im stabilen Gleichgewicht." : status === 'nachfrageueberhang' ? "Nachfrageüberschuss: Preise steigen." : "Angebotsüberschuss: Preise sinken.")}</span>
              )}
            </div>

            <div className="w-full bg-slate-50 rounded-[2rem] p-4 flex items-center justify-center aspect-square md:aspect-auto md:min-h-[400px] border border-slate-100 relative overflow-hidden shadow-inner">
              {viewMode === 'visual' ? (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                  {interventionMode === 'mindestpreis' && <div className="text-rose-600 font-black text-3xl mb-4 animate-pulse">ÜBERFLUSS</div>}
                  {interventionMode === 'hoechstpreis' && <div className="text-sky-600 font-black text-3xl mb-4 animate-pulse">MANGEL</div>}
                  {!interventionMode && (
                    <>
                      {status === 'nachfrageueberhang' && <ArrowUp size={100} className="text-emerald-500 animate-bounce" />}
                      {status === 'angebotsueberhang' && <ArrowDown size={100} className="text-rose-500 animate-bounce" />}
                      {status === 'gleichgewicht' && (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-2 bg-slate-300 rounded-full relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-12 bg-slate-500 rounded-full"></div>
                          </div>
                          <span className="mt-8 text-indigo-600 font-black tracking-widest uppercase text-lg">Balance</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                  <svg viewBox="0 0 200 200" className="w-full h-full max-w-[320px] overflow-visible drop-shadow-sm">
                    <line x1="25" y1="20" x2="25" y2="180" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="25" y1="180" x2="185" y2="180" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="10" y="15" fontSize="10" fill="#94a3b8" fontWeight="900">P</text>
                    <text x="180" y="195" fontSize="10" fill="#94a3b8" fontWeight="900">M</text>
                    <line className="graph-line" x1={nLine.x1} y1={nLine.y1} x2={nLine.x2} y2={nLine.y2} stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                    <text className="graph-line" x={nLine.x2 + 5} y={nLine.y2 + 4} fontSize="11" fill="#f59e0b" fontWeight="900">N</text>
                    <line className="graph-line" x1={aLine.x1} y1={aLine.y1} x2={aLine.x2} y2={aLine.y2} stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
                    <text className="graph-line" x={aLine.x2 + 5} y={aLine.y2 + 4} fontSize="11" fill="#10b981" fontWeight="900">A</text>
                    {interventionMode && (
                      <g>
                        <rect className="graph-line" x={Math.min(nXAtPFix, aXAtPFix)} y={pFixY - 2} width={Math.max(5, Math.abs(nXAtPFix - aXAtPFix))} height="4" rx="2" fill={interventionMode === 'mindestpreis' ? '#f43f5e' : '#0ea5e9'} opacity="0.3" />
                        <line x1="25" y1={pFixY} x2="185" y2={pFixY} stroke={interventionMode === 'mindestpreis' ? '#f43f5e' : '#0ea5e9'} strokeWidth="1.5" strokeDasharray="3 3" />
                      </g>
                    )}
                    <circle className="graph-point" cx={interX} cy={interY} r="5" fill="#1e293b" stroke="white" strokeWidth="2" />
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3 w-full">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <ShoppingBasket size={20} className="text-emerald-600" />
                <div>
                  <div className="text-[9px] text-emerald-600 font-black uppercase tracking-wider">Menge</div>
                  <div className="font-bold text-sm text-emerald-900">{angebot} Stk.</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <Wallet size={20} className="text-amber-600" />
                <div>
                  <div className="text-[9px] text-amber-600 font-black uppercase tracking-wider">Kunden</div>
                  <div className="font-bold text-sm text-amber-900">{nachfrage} P.</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* LINKE SPALTE (Interaktionen) */}
        <div className="space-y-6 lg:order-1 order-last">
          {/* Parameter */}
          <section className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Info size={18} className="text-indigo-500" /> Markt-Parameter
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-sm text-slate-700">🍎 Angebot</label>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-black text-sm">{angebot}</span>
                </div>
                <input
                  type="range" min="1" max="100" value={angebot}
                  onChange={(e) => { setAngebot(parseInt(e.target.value)); setSzenarioText(""); setQuizFeedback(null); }}
                  className="w-full bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-sm text-slate-700">💰 Nachfrage</label>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-black text-sm">{nachfrage}</span>
                </div>
                <input
                  type="range" min="0" max="100" value={nachfrage}
                  onChange={(e) => { setNachfrage(parseInt(e.target.value)); setSzenarioText(""); setQuizFeedback(null); }}
                  className="w-full bg-slate-100 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </section>

          {/* Szenarien */}
          <section className="bg-white p-5 rounded-[2rem] shadow-lg border border-slate-100">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2 text-slate-800"><Zap size={18} className="text-orange-500" /> Schnell-Szenarien</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleSzenario(15, 50, "Knappheit! Eine Missernte reduziert das Angebot.")} className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-700 text-left flex flex-col gap-1 transition-all">
                <span className="text-base">🌾</span> Missernte
              </button>
              <button onClick={() => handleSzenario(50, 95, "Ein Social-Media-Hype treibt die Nachfrage extrem an.")} className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl text-[10px] font-bold text-sky-700 text-left flex flex-col gap-1 transition-all">
                <span className="text-base">🔥</span> Trend-Hype
              </button>
              <button onClick={() => handleSzenario(95, 20, "Überproduktion! Die Lager sind voll, kaum Käufer.")} className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl text-[10px] font-bold text-orange-700 text-left flex flex-col gap-1 transition-all">
                <span className="text-base">🏭</span> Überfluss
              </button>
              <button onClick={resetAll} className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-all">
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </section>

          {/* Eingriff */}
          <section className="bg-white p-5 rounded-[2rem] shadow-lg border border-rose-100">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2 text-rose-700">
              <ShieldAlert size={18} className="text-rose-500" /> Markt-Eingriff
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => toggleIntervention('mindestpreis')} className={`p-3 rounded-xl font-bold flex flex-col items-center gap-1 border-2 transition-all ${interventionMode === 'mindestpreis' ? 'bg-rose-600 border-rose-700 text-white' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                <ArrowUp size={16} /> <span className="text-[10px]">Mindestpreis</span>
              </button>
              <button onClick={() => toggleIntervention('hoechstpreis')} className={`p-3 rounded-xl font-bold flex flex-col items-center gap-1 border-2 transition-all ${interventionMode === 'hoechstpreis' ? 'bg-sky-600 border-sky-700 text-white' : 'bg-sky-50 border-sky-100 text-sky-700'}`}>
                <ArrowDown size={16} /> <span className="text-[10px]">Höchstpreis</span>
              </button>
            </div>
          </section>

          {/* Quiz */}
          <section className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-indigo-400" /> Challenge
            </h2>
            <p className="text-sm mb-6 text-slate-300 leading-relaxed">{quizFragen[currentQuiz].frage}</p>
            <div className="flex flex-col gap-2">
              <button disabled={quizFeedback === 'correct'} onClick={() => checkAnswer('steigt')} className={`w-full py-3 rounded-xl font-bold text-md transition-all ${quizFeedback === 'correct' ? 'bg-slate-800 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500'}`}>Steigt</button>
              <button disabled={quizFeedback === 'correct'} onClick={() => checkAnswer('sinkt')} className={`w-full py-3 rounded-xl font-bold text-md transition-all ${quizFeedback === 'correct' ? 'bg-slate-800 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500'}`}>Sinkt</button>
            </div>
            {quizFeedback && (
              <div className={`mt-4 flex items-center gap-3 p-3 rounded-xl ${quizFeedback === 'correct' ? 'bg-emerald-900/50 border border-emerald-500' : 'bg-rose-900/50 border border-rose-500'}`}>
                {quizFeedback === 'correct' ? <CheckCircle2 className="text-emerald-400" size={20} /> : <XCircle className="text-rose-400" size={20} />}
                <div className="flex-1">
                  <p className="text-[10px] font-bold">{quizFeedback === 'correct' ? 'Hervorragend!' : 'Versuch es nochmal'}</p>
                  {quizFeedback === 'correct' && <button onClick={nextQuiz} className="text-[9px] text-emerald-400 underline font-black">Nächste Challenge</button>}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="w-full max-w-6xl mt-12 py-8 border-t border-slate-200 flex flex-col items-center gap-4">
        <div className="text-slate-400 text-[9px] uppercase font-black tracking-widest">Digitale Lerneinheit: Markt & Preisbildung</div>
        <a href="https://github.com/mariusskroce" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:shadow-md transition-all">
          <Github size={16} /> @mariusskroce
        </a>
      </footer>
    </div>
  );
};

export default App;