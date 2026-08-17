import React from 'react';

/**
 * RobotAvatar Component
 * Renders an interactive, expressive SVG robot that changes pose based on the `pose` prop.
 * Available poses:
 * - 'happy': Welcoming, smiling, waving one hand.
 * - 'thinking': Curious, looking up/side, hand on chin.
 * - 'shy': Shy/private, covering eyes (perfect for password fields).
 */
function RobotAvatar({ pose = 'happy', className = 'w-[150px] h-[150px]' }) {
  // Select styles and animations depending on the pose
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
      
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500 ease-in-out"
      >
        {/* Antennas / Ears */}
        <path d="M 80 50 L 65 30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="65" cy="30" r="6" fill="#60a5fa" className="animate-pulse" />
        
        <path d="M 120 50 L 135 30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="135" cy="30" r="6" fill="#60a5fa" className="animate-pulse" />
        
        {/* Neck */}
        <rect x="92" y="112" width="16" height="12" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />
        
        {/* Body */}
        <rect x="70" y="122" width="60" height="50" rx="15" fill="#0f172a" stroke="#3b82f6" strokeWidth="4" />
        {/* Glowing chest core */}
        <circle cx="100" cy="147" r="10" fill="#3b82f6" className="animate-pulse" />
        <circle cx="100" cy="147" r="6" fill="#93c5fd" />

        {/* Head */}
        <rect x="60" y="45" width="80" height="70" rx="20" fill="#0f172a" stroke="#3b82f6" strokeWidth="4" />
        
        {/* Face Screen */}
        <rect x="68" y="53" width="64" height="46" rx="12" fill="#020617" stroke="#1e3a8a" strokeWidth="2" />

        {/* Eyes & Blushes depending on the pose */}
        {pose === 'happy' && (
          <>
            {/* Smiling happy eyes */}
            <path d="M 78 75 Q 85 65 92 75" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-bounce" />
            <path d="M 108 75 Q 115 65 122 75" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-bounce" />
            {/* Cheerful mouth */}
            <path d="M 92 88 Q 100 96 108 88" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Soft pink blush */}
            <circle cx="74" cy="82" r="4" fill="#f472b6" opacity="0.6" />
            <circle cx="126" cy="82" r="4" fill="#f472b6" opacity="0.6" />
          </>
        )}

        {pose === 'thinking' && (
          <>
            {/* Thinking / Curious eyes (one slightly squinting, looking up) */}
            <circle cx="85" cy="70" r="5" fill="#60a5fa" />
            <ellipse cx="115" cy="73" rx="5" ry="3" fill="#60a5fa" />
            
            {/* Squiggly/doubtful mouth */}
            <path d="M 92 88 Q 96 85 100 88 T 108 88" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" fill="none" />
            
            {/* Left eyebrow flat, right eyebrow arched */}
            <path d="M 80 62 L 90 62" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 108 63 Q 115 58 122 65" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {pose === 'shy' && (
          <>
            {/* Closed / shy eyes */}
            <path d="M 78 75 Q 85 82 92 75" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 108 75 Q 115 82 122 75" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* O-mouth (surprised/shy) */}
            <circle cx="100" cy="88" r="4.5" fill="none" stroke="#60a5fa" strokeWidth="3" />
            {/* Deep blushing cheeks */}
            <circle cx="73" cy="82" r="6" fill="#f43f5e" opacity="0.75" className="animate-pulse" />
            <circle cx="127" cy="82" r="6" fill="#f43f5e" opacity="0.75" className="animate-pulse" />
          </>
        )}

        {/* Arms depending on the pose */}
        {pose === 'happy' && (
          <>
            {/* Waving Right arm */}
            <path
              d="M 130 135 C 145 125 155 105 150 90 C 148 83 155 80 157 87 C 163 105 150 132 130 145"
              fill="#0f172a"
              stroke="#3b82f6"
              strokeWidth="3.5"
            />
            {/* Wave animation hand glow */}
            <circle cx="150" cy="88" r="6" fill="#60a5fa" className="animate-ping" />
            <circle cx="150" cy="88" r="4" fill="#93c5fd" />
            
            {/* Left arm relaxed */}
            <path d="M 70 135 C 55 145 50 160 55 170" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" />
          </>
        )}

        {pose === 'thinking' && (
          <>
            {/* Arm rest and hand touching chin */}
            <path
              d="M 130 135 C 145 145 150 160 145 170"
              stroke="#3b82f6"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            
            {/* Left arm bent up to chin */}
            <path
              d="M 70 135 Q 50 130 55 105 Q 60 95 85 98"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="85" cy="98" r="4" fill="#60a5fa" />
          </>
        )}

        {pose === 'shy' && (
          <>
            {/* Both arms raised to cover eyes */}
            <path
              d="M 70 135 Q 52 110 76 75"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Hand circle over left eye */}
            <circle cx="76" cy="75" r="7" fill="#1e293b" stroke="#60a5fa" strokeWidth="2.5" />
            
            <path
              d="M 130 135 Q 148 110 124 75"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Hand circle over right eye */}
            <circle cx="124" cy="75" r="7" fill="#1e293b" stroke="#60a5fa" strokeWidth="2.5" />
          </>
        )}
      </svg>
    </div>
  );
}

export default RobotAvatar;
