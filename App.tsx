
import React, { useState, useEffect, useCallback } from 'react';
import { CipherWheel } from './components/CipherWheel';
import { AIImageLab } from './components/AIImageLab';
import { Shield, RotateCw, Settings2, Info, Sparkles } from 'lucide-react';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const caesarCipher = (text: string, shift: number, encrypt: boolean = true) => {
  const s = encrypt ? shift : (26 - (shift % 26)) % 26;
  return text
    .toUpperCase()
    .split("")
    .map(char => {
      const index = ALPHABET.indexOf(char);
      if (index === -1) return char;
      return ALPHABET[(index + s) % 26];
    })
    .join("");
};

export default function App() {
  const [shift, setShift] = useState(23);
  const [refLetter, setRefLetter] = useState("A");
  const [input, setInput] = useState("CLAYTON");
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState<'cipher' | 'lab'>('cipher');

  const updateOutput = useCallback(() => {
    setOutput(caesarCipher(input, shift, true));
  }, [input, shift]);

  useEffect(() => {
    updateOutput();
  }, [updateOutput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, "");
    setInput(val);
  };

  const handleOutputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, "");
    setOutput(val);
    setInput(caesarCipher(val, shift, false));
  };

  const handleShiftChange = (newShift: number) => {
    setShift(newShift);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              CIPHER<span className="text-indigo-500">NEXUS</span>
            </h1>
          </div>
          <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('cipher')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'cipher' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cipher Engine
            </button>
            <button
              onClick={() => setActiveTab('lab')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'lab' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Visualizer
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {activeTab === 'cipher' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Interactive Wheel */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative group w-full max-w-[500px]">
                <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <CipherWheel 
                  shift={shift} 
                  onShiftChange={handleShiftChange}
                  cipherCode={output} 
                  crackedCode={input} 
                  refLetter={refLetter}
                  onRefLetterChange={setRefLetter}
                />
              </div>
            </div>

            {/* Right: Controls */}
            <div className="lg:col-span-5 space-y-8">
              <section className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Settings2 className="w-5 h-5" />
                    <h2 className="font-bold uppercase tracking-wider text-xs">Shift Configuration</h2>
                  </div>
                  <span className="text-2xl font-black font-mono-code text-indigo-500">{shift}</span>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={shift}
                    onChange={(e) => setShift(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                    <span>Shift 0</span>
                    <span>Shift 13</span>
                    <span>Shift 25</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Decoded Text (Cracked Code)</label>
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Type your secret..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono-code text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Encoded Text (Cipher Code)</label>
                    <input
                      type="text"
                      value={output}
                      onChange={handleOutputChange}
                      placeholder="Uryyb Jbeyq..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono-code text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-red-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => { setInput(""); setOutput(""); }}
                        className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCw className="w-4 h-4" /> Reset
                    </button>
                    <button 
                        onClick={() => {
                            const temp = input;
                            setInput(output);
                            setOutput(temp);
                        }}
                        className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                    >
                        Swap Modes
                    </button>
                </div>
              </section>

              <section className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-3xl flex gap-4">
                <div className="p-2 bg-indigo-500/20 rounded-xl h-fit">
                  <Info className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-indigo-300 mb-1">How it works</h3>
                  <p className="text-xs text-indigo-200/60 leading-relaxed">
                    The Caesar Cipher is a substitution cipher where each letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. Rotate the wheel directly or edit the center values to set your offset.
                  </p>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <AIImageLab />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 px-4 text-center text-slate-600 text-xs">
        <p>&copy; 2024 CipherNexus. Engineered with Precision & Gemini Intelligence.</p>
      </footer>
    </div>
  );
}
