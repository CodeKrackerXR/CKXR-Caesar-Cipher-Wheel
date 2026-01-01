
import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Download, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export const AIImageLab: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureWheel = () => {
    const svg = document.getElementById('cipher-wheel-svg');
    if (!svg) return null;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Scale up for better quality
    canvas.width = 1000;
    canvas.height = 1000;
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<string>((resolve) => {
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, 1000, 1000);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });
  };

  const handleRemix = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const base64 = await captureWheel();
      if (!base64) throw new Error("Failed to capture wheel");
      
      const gemini = GeminiService.getInstance();
      const result = await gemini.editImage(base64, prompt);
      
      if (result) {
        setResultImage(result);
      } else {
        throw new Error("No image returned from AI");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `cipher-nexus-remix-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight">AI Visual <span className="text-indigo-500">Stylist</span></h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Use the power of Gemini 2.5 Flash Image to transform your wheel. Try "Make it look like it's from steampunk era" or "Add a cosmic space background".
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input/Original Side */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
            <Camera className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Live Wheel Reference</p>
            <div className="mt-6 text-center text-xs text-slate-600 px-8">
              The AI will use your current wheel configuration (Shift & Text) as a starting point.
            </div>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision (e.g. 'Add a neon retro filter' or 'Make it wooden')..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none min-h-[100px] transition-all resize-none"
            />
            <button
              onClick={handleRemix}
              disabled={isProcessing || !prompt.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gemini is thinking...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Stylized Version
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Side */}
        <div className="space-y-4">
          <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl aspect-square flex flex-col items-center justify-center relative overflow-hidden">
            {resultImage ? (
              <img src={resultImage} alt="Remixed result" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-8">
                <Sparkles className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-600 text-sm font-medium">Your AI masterpiece will appear here</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin relative" />
                </div>
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">Applying AI Magic</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {resultImage && (
            <button
              onClick={downloadImage}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              Download Artwork
            </button>
          )}
        </div>
      </div>

      <div className="pt-8 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          "Make it look like antique bronze with verdigris",
          "Neon cyberpunk aesthetic with glitches",
          "Traditional hand-carved wood with ivory inlays"
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setPrompt(suggestion)}
            className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-left hover:border-indigo-500/50 transition-all group"
          >
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Try suggestion</p>
            <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">"{suggestion}"</p>
          </button>
        ))}
      </div>
    </div>
  );
};
