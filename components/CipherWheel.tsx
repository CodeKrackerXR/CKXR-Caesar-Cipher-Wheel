
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CipherWheelProps {
  shift: number;
  onShiftChange: (newShift: number) => void;
  cipherCode: string;
  crackedCode: string;
  refLetter: string;
  onRefLetterChange: (letter: string) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const CipherWheel: React.FC<CipherWheelProps> = ({ 
  shift, 
  onShiftChange, 
  cipherCode, 
  crackedCode,
  refLetter,
  onRefLetterChange
}) => {
  const size = 500;
  const center = size / 2;
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const startShift = useRef(0);

  // Ring Boundaries
  const outerRadius = 240;      // Blue ring outer
  const innerRadius = 185;      // Blue ring inner / Red ring outer
  const numberRadius = 135;     // Red ring inner / Green ring outer
  const centralDiskRadius = 110; // Green ring inner / Slate disk outer

  // Mid-points for text centering
  const outerMidRadius = innerRadius + (outerRadius - innerRadius) / 2; 
  const innerMidRadius = numberRadius + (innerRadius - numberRadius) / 2; 
  const numberMidRadius = centralDiskRadius + (numberRadius - centralDiskRadius) / 2; 

  const getPos = (radius: number, index: number, total: number = 26) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      angle: (index / total) * 360
    };
  };

  const getMouseAngle = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    startAngle.current = getMouseAngle(e);
    startShift.current = shift;
    e.preventDefault();
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const currentAngle = getMouseAngle(e);
    const deltaAngle = currentAngle - startAngle.current;
    
    // Convert angle delta to shift delta (clockwise rotation decreases the shift index at top)
    // 360 degrees = 26 letters
    const deltaShift = Math.round((deltaAngle / 360) * 26);
    let newShift = (startShift.current - deltaShift) % 26;
    if (newShift < 0) newShift += 26;
    
    onShiftChange(newShift);
  }, [onShiftChange]);

  const handleEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleMove]);

  // Logic for center number display based on reference letter
  const refIndex = ALPHABET.indexOf(refLetter.toUpperCase());
  const refNumber = (shift + refIndex) % 26;
  const formattedRefNumber = refNumber.toString().padStart(2, '0');

  const handleLetterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    if (val) onRefLetterChange(val);
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(-2);
    if (val !== "") {
      const num = parseInt(val);
      if (num >= 0 && num <= 25) {
        // Recalculate shift: Shift = (NewNumber - RefLetterIndex)
        let newShift = (num - refIndex) % 26;
        if (newShift < 0) newShift += 26;
        onShiftChange(newShift);
      }
    }
  };

  return (
    <div className="relative cursor-grab active:cursor-grabbing">
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`} 
        className="w-full h-auto drop-shadow-2xl select-none"
        id="cipher-wheel-svg"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="diskGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>

        {/* Outer Blue Ring (Fixed Alphabet - Represents Plaintext) */}
        <circle cx={center} cy={center} r={outerRadius} fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
        {ALPHABET.map((letter, i) => {
          const { angle } = getPos(outerMidRadius, i);
          return (
            <g key={`outer-${letter}`} transform={`rotate(${angle}, ${center}, ${center})`}>
              <line x1={center} y1={center - outerRadius} x2={center} y2={center - innerRadius} stroke="#1d4ed8" strokeWidth="1" />
              <text
                x={center}
                y={center - outerMidRadius}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="24"
                fontWeight="900"
                className="pointer-events-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {letter}
              </text>
            </g>
          );
        })}

        {/* Rotating Inner Assembly (Red Alphabet + Green Numbers move together) */}
        <g 
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          transform={`rotate(${(-shift / 26) * 360}, ${center}, ${center})`} 
          className="transition-transform duration-300 ease-out will-change-transform"
          style={{ transition: isDragging.current ? 'none' : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          
          {/* Inner Red Ring (Ciphertext Alphabet) */}
          <circle cx={center} cy={center} r={innerRadius} fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
          {ALPHABET.map((letter, i) => {
            const { angle } = getPos(innerMidRadius, i);
            return (
              <g key={`inner-${letter}`} transform={`rotate(${angle}, ${center}, ${center})`}>
                  <line x1={center} y1={center - innerRadius} x2={center} y2={center - numberRadius} stroke="#991b1b" strokeWidth="1" />
                  <text
                      x={center}
                      y={center - innerMidRadius}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="22"
                      fontWeight="800"
                      className="pointer-events-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                      {letter}
                  </text>
              </g>
            );
          })}

          {/* Green Number Ring (Key Indicator Numbers) */}
          <circle cx={center} cy={center} r={numberRadius} fill="#22c55e" stroke="#15803d" strokeWidth="2" />
          {Array.from({ length: 26 }).map((_, i) => {
            const { angle } = getPos(numberMidRadius, i);
            // RULE: Highlight ONLY the number displayed in the center (refNumber)
            const isTargetNumber = i === (refNumber % 26);
            return (
              <g key={`num-${i}`} transform={`rotate(${angle}, ${center}, ${center})`}>
                {isTargetNumber && (
                  <rect 
                    x={center - 15} 
                    y={center - numberRadius} 
                    width="30" 
                    height={numberRadius - centralDiskRadius} 
                    fill="#facc15" 
                    className="pointer-events-none"
                  />
                )}
                <text
                  x={center}
                  y={center - numberMidRadius}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isTargetNumber ? "#000000" : "#ffffff"}
                  fontSize={isTargetNumber ? "18" : "16"}
                  fontWeight="900"
                  className="pointer-events-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {i}
                </text>
              </g>
            );
          })}
        </g>

        {/* Central Disk (Fixed) */}
        <circle cx={center} cy={center} r={centralDiskRadius} fill="url(#diskGradient)" stroke="#0f172a" strokeWidth="4" className="pointer-events-none" />
        
        {/* HUD Info Text (Fixed in center) */}
        <g transform={`translate(${center}, ${center})`}>
          {/* Reference Indicator: [Letter] = [Number] - No gap to keep them extremely close */}
          <foreignObject x="-80" y="-105" width="160" height="40">
            <div className="flex items-center justify-center h-full gap-0 text-2xl font-black font-inter">
              <input
                type="text"
                value={refLetter}
                onChange={handleLetterInput}
                className="w-10 bg-transparent text-center text-white border-b-2 border-transparent hover:border-white/20 focus:border-white focus:outline-none transition-colors"
                maxLength={1}
              />
              <span className="text-slate-500 font-normal px-0.5">=</span>
              <input
                type="text"
                value={formattedRefNumber}
                onChange={handleNumberInput}
                className="w-12 bg-transparent text-center text-[#facc15] border-b-2 border-transparent hover:border-[#facc15]/20 focus:border-[#facc15] focus:outline-none transition-all font-mono font-bold"
                maxLength={2}
              />
            </div>
          </foreignObject>

          {/* Cipher Code Label */}
          <text y="-32" textAnchor="middle" fill="#cbd5e1" fontSize="12.5" fontWeight="800" style={{ textTransform: 'uppercase', letterSpacing: '2px' }} className="pointer-events-none">
            Cipher Code
          </text>
          {/* Cipher Code Value */}
          <text y="0" textAnchor="middle" fill="#ef4444" fontSize="28" fontWeight="900" style={{ fontFamily: "'JetBrains Mono', monospace" }} className="pointer-events-none">
            {cipherCode.length > 10 ? cipherCode.slice(0, 8) + "..." : cipherCode || "---"}
          </text>

          {/* Cracked Code Label */}
          <text y="25" textAnchor="middle" fill="#cbd5e1" fontSize="12.5" fontWeight="800" style={{ textTransform: 'uppercase', letterSpacing: '2px' }} className="pointer-events-none">
            Cracked Code
          </text>
          {/* Cracked Code Value */}
          <text y="57" textAnchor="middle" fill="#3b82f6" fontSize="28" fontWeight="900" style={{ fontFamily: "'JetBrains Mono', monospace" }} className="pointer-events-none">
            {crackedCode.length > 10 ? crackedCode.slice(0, 8) + "..." : crackedCode || "---"}
          </text>
        </g>
      </svg>
      {/* Visual Cue for Interaction */}
      <div className="absolute top-4 right-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-800/80 backdrop-blur p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
          <span>Drag Wheel to Rotate</span>
        </div>
      </div>
    </div>
  );
};
