
import React from 'react';

interface CipherWheelProps {
  shift: number;
  cipherCode: string;
  crackedCode: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const CipherWheel: React.FC<CipherWheelProps> = ({ shift, cipherCode, crackedCode }) => {
  const size = 500;
  const center = size / 2;
  
  // Ring Boundaries
  const outerRadius = 240;      // Blue ring outer
  const innerRadius = 185;      // Blue ring inner / Red ring outer
  const numberRadius = 135;     // Red ring inner / Green ring outer
  const centralDiskRadius = 110; // Green ring inner / Slate disk outer

  // Mid-points for text centering
  const outerMidRadius = innerRadius + (outerRadius - innerRadius) / 2; // 212.5
  const innerMidRadius = numberRadius + (innerRadius - numberRadius) / 2; // 160
  const numberMidRadius = centralDiskRadius + (numberRadius - centralDiskRadius) / 2; // 122.5

  const getPos = (radius: number, index: number, total: number = 26) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      angle: (index / total) * 360
    };
  };

  return (
    <svg 
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
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {letter}
            </text>
          </g>
        );
      })}

      {/* Rotating Inner Assembly (Red Alphabet + Green Numbers move together) */}
      <g 
        transform={`rotate(${(-shift / 26) * 360}, ${center}, ${center})`} 
        style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
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
          // Highlight the number that represents the current shift
          const isShiftNumber = i === (shift % 26);
          return (
            <g key={`num-${i}`} transform={`rotate(${angle}, ${center}, ${center})`}>
              {isShiftNumber && (
                <rect 
                  x={center - 15} 
                  y={center - numberRadius} 
                  width="30" 
                  height={numberRadius - centralDiskRadius} 
                  fill="#facc15" 
                  stroke="#854d0e"
                  strokeWidth="1"
                />
              )}
              <text
                x={center}
                y={center - numberMidRadius}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isShiftNumber ? "#1e293b" : "#dcfce7"}
                fontSize="16"
                fontWeight="800"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {i}
              </text>
            </g>
          );
        })}
      </g>

      {/* Central Disk (Fixed) - Pure black background for better contrast */}
      <circle cx={center} cy={center} r={centralDiskRadius} fill="url(#diskGradient)" stroke="#0f172a" strokeWidth="4" />
      
      {/* HUD Info Text (Fixed in center) */}
      <g transform={`translate(${center}, ${center})`}>
        {/* A = Shift indicator: Moved down 10% from -82 to -74 */}
        <text y="-74" textAnchor="middle" fill="#ef4444" fontSize="24" fontWeight="900" style={{ fontFamily: "'Inter', sans-serif" }}>
          <tspan fill="white">A</tspan> = <tspan fill="#facc15">{shift}</tspan>
        </text>

        {/* Cipher Code Section */}
        <text y="-32" textAnchor="middle" fill="#cbd5e1" fontSize="12.5" fontWeight="800" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>
          Cipher Code
        </text>
        <text y="0" textAnchor="middle" fill="#ef4444" fontSize="28" fontWeight="900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {cipherCode.length > 10 ? cipherCode.slice(0, 8) + "..." : cipherCode || "---"}
        </text>

        {/* Cracked Code Section */}
        <text y="25" textAnchor="middle" fill="#cbd5e1" fontSize="12.5" fontWeight="800" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>
          Cracked Code
        </text>
        <text y="57" textAnchor="middle" fill="#3b82f6" fontSize="28" fontWeight="900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {crackedCode.length > 10 ? crackedCode.slice(0, 8) + "..." : crackedCode || "---"}
        </text>
      </g>
    </svg>
  );
};
