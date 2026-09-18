import React from 'react';

export type TermyMood = 'idle' | 'thinking' | 'celebrating' | 'encouraging' | 'streak';

interface TermyBearProps {
  mood?: TermyMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speechText?: string;
  className?: string;
  showSpeechBubble?: boolean;
}

export const TermyBear: React.FC<TermyBearProps> = ({
  mood = 'idle',
  size = 'md',
  speechText,
  className = '',
  showSpeechBubble = true,
}) => {
  const sizeMap = {
    sm: { width: 56, height: 56, textClass: 'text-xs' },
    md: { width: 96, height: 96, textClass: 'text-sm' },
    lg: { width: 140, height: 140, textClass: 'text-base' },
    xl: { width: 200, height: 200, textClass: 'text-lg' },
  };

  const { width, height } = sizeMap[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {showSpeechBubble && speechText && (
        <div className="relative mb-2 max-w-xs px-3.5 py-2 bg-surface-container-high border-2 border-card-border text-on-surface rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs sm:text-sm font-semibold leading-snug">
            <span className="text-primary font-bold mr-1">Termy:</span>
            {speechText}
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-card-border" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-surface-container-high" />
        </div>
      )}

      {/* Termy Vector Illustration */}
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop based on mood */}
        {mood === 'streak' && (
          <div className="absolute -inset-3 rounded-full bg-lightning-gold/20 blur-lg animate-pulse" />
        )}
        {mood === 'celebrating' && (
          <div className="absolute -inset-3 rounded-full bg-primary/20 blur-lg animate-pulse" />
        )}

        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300"
        >
          {/* Bear Ears */}
          <circle cx="48" cy="48" r="16" fill="#e2f1f8" stroke="#1b2e35" strokeWidth="3" />
          <circle cx="48" cy="48" r="9" fill="#c7e2ef" />
          <circle cx="112" cy="48" r="16" fill="#e2f1f8" stroke="#1b2e35" strokeWidth="3" />
          <circle cx="112" cy="48" r="9" fill="#c7e2ef" />

          {/* Body / Shoulders */}
          <path
            d="M32 154C32 122 54 114 80 114C106 114 128 122 128 154"
            fill="#152126"
            stroke="#2b4754"
            strokeWidth="3.5"
          />
          {/* Tech Hoodie Collar & Terminal Prompt Accent */}
          <path d="M64 116L80 134L96 116" fill="#202c31" stroke="#37464f" strokeWidth="2" />
          <path d="M74 138L80 144L74 150" stroke="#74e930" strokeWidth="2.5" strokeLinecap="round" />

          {/* Ice-Bear Head */}
          <ellipse
            cx="80"
            cy="84"
            rx="46"
            ry="42"
            fill="#f0f9ff"
            stroke="#1b2e35"
            strokeWidth="3.5"
          />
          {/* Snout Area */}
          <ellipse cx="80" cy="95" rx="22" ry="16" fill="#ffffff" />
          {/* Dark Snout Nose */}
          <ellipse cx="80" cy="88" rx="8" ry="6" fill="#1b2e35" />
          <ellipse cx="78" cy="86" rx="2.5" ry="1.5" fill="#88ceff" opacity="0.6" />

          {/* Mouth expressions based on mood */}
          {mood === 'celebrating' ? (
            <path
              d="M72 96Q80 106 88 96"
              stroke="#1b2e35"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="#ff4b4b"
            />
          ) : mood === 'thinking' ? (
            <path
              d="M74 98Q80 97 86 99"
              stroke="#1b2e35"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : mood === 'encouraging' ? (
            <path
              d="M73 96Q80 103 87 96"
              stroke="#1b2e35"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M74 96Q80 101 86 96"
              stroke="#1b2e35"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Cheeks */}
          <circle cx="56" cy="94" r="5" fill="#88ceff" opacity="0.25" />
          <circle cx="104" cy="94" r="5" fill="#88ceff" opacity="0.25" />

          {/* Orange Beanie Hat (Top & Knit Fold) */}
          <path
            d="M44 54C44 26 60 16 80 16C100 16 116 26 116 54Z"
            fill="#ea580c"
            stroke="#1b2e35"
            strokeWidth="3.5"
          />
          {/* Beanie Knit texture stripes */}
          <path d="M60 25C68 21 92 21 100 25" stroke="#f97316" strokeWidth="2.5" />
          <path d="M52 38C64 33 96 33 108 38" stroke="#f97316" strokeWidth="2.5" />
          {/* Beanie Fold Ribbing */}
          <rect
            x="40"
            y="46"
            width="80"
            height="15"
            rx="7"
            fill="#f97316"
            stroke="#1b2e35"
            strokeWidth="3"
          />
          {/* Beanie Pom-pom on top */}
          <circle cx="80" cy="14" r="9" fill="#ff781f" stroke="#1b2e35" strokeWidth="2.5" />

          {/* Focus Goggles Strap */}
          <path
            d="M34 68H126"
            stroke="#242e34"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Focus Goggles Outer Frames */}
          <rect
            x="44"
            y="60"
            width="32"
            height="22"
            rx="8"
            fill="#152126"
            stroke="#2b4754"
            strokeWidth="3"
          />
          <rect
            x="84"
            y="60"
            width="32"
            height="22"
            rx="8"
            fill="#152126"
            stroke="#2b4754"
            strokeWidth="3"
          />
          {/* Goggles Bridge */}
          <rect x="74" y="68" width="12" height="5" rx="2" fill="#2b4754" />

          {/* Goggles Cyan Lenses */}
          <rect
            x="47"
            y="63"
            width="26"
            height="16"
            rx="6"
            fill={mood === 'streak' ? '#ffc800' : '#88ceff'}
            opacity="0.9"
          />
          <rect
            x="87"
            y="63"
            width="26"
            height="16"
            rx="6"
            fill={mood === 'streak' ? '#ffc800' : '#88ceff'}
            opacity="0.9"
          />

          {/* Eyes behind lenses */}
          <circle
            cx={mood === 'thinking' ? 57 : 60}
            cy="71"
            r="4"
            fill="#09151a"
          />
          <circle
            cx={mood === 'thinking' ? 97 : 100}
            cy="71"
            r="4"
            fill="#09151a"
          />
          <circle
            cx={mood === 'thinking' ? 56 : 59}
            cy="69"
            r="1.5"
            fill="#ffffff"
          />
          <circle
            cx={mood === 'thinking' ? 96 : 99}
            cy="69"
            r="1.5"
            fill="#ffffff"
          />

          {/* Goggles Glare Reflection Diagonal Bars */}
          <path
            d="M50 74L60 64M63 74L68 69"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M90 74L100 64M103 74L108 69"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Paws for Celebratory or Thinking poses */}
          {mood === 'celebrating' && (
            <>
              {/* Left Raised Paw */}
              <ellipse cx="28" cy="80" rx="10" ry="12" fill="#f0f9ff" stroke="#1b2e35" strokeWidth="2.5" />
              <circle cx="28" cy="78" r="4" fill="#c7e2ef" />
              {/* Right Raised Paw */}
              <ellipse cx="132" cy="80" rx="10" ry="12" fill="#f0f9ff" stroke="#1b2e35" strokeWidth="2.5" />
              <circle cx="132" cy="78" r="4" fill="#c7e2ef" />
            </>
          )}

          {mood === 'thinking' && (
            <>
              {/* Right Paw Touching Chin / Goggles */}
              <ellipse cx="106" cy="88" rx="9" ry="10" fill="#f0f9ff" stroke="#1b2e35" strokeWidth="2.5" />
              <circle cx="106" cy="88" r="3.5" fill="#c7e2ef" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
