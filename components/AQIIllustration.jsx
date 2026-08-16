export default function AQIIllustration({ className = "" }) {
    return (
        <svg viewBox="0 0 400 240" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EEF2FF" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
                <linearGradient id="hazeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
                </linearGradient>
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
                </radialGradient>
            </defs>

            <rect x="0" y="0" width="400" height="240" fill="url(#skyGrad)" rx="16" />

            {/* Sun with soft glow */}
            <circle cx="330" cy="55" r="50" fill="url(#sunGlow)" />
            <circle cx="330" cy="55" r="24" fill="#FDE68A" opacity="0.85" />

            {/* Clouds */}
            <g opacity="0.5" fill="#FFFFFF" stroke="#E0E7FF" strokeWidth="0.5">
                <ellipse cx="80" cy="35" rx="22" ry="10" />
                <ellipse cx="98" cy="30" rx="16" ry="9" />
                <ellipse cx="190" cy="28" rx="18" ry="8" />
                <ellipse cx="205" cy="24" rx="13" ry="7" />
            </g>

            {/* City skyline silhouette with windows */}
            <g opacity="0.9">
                <rect x="20" y="140" width="34" height="80" fill="#C7D2FE" rx="2" />
                <rect x="60" y="110" width="28" height="110" fill="#A5B4FC" rx="2" />
                <rect x="94" y="150" width="24" height="70" fill="#C7D2FE" rx="2" />
                <rect x="124" y="95" width="32" height="125" fill="#818CF8" rx="2" />
                <rect x="162" y="130" width="26" height="90" fill="#A5B4FC" rx="2" />
                <rect x="194" y="70" width="30" height="150" fill="#6366F1" rx="2" />
                <rect x="230" y="120" width="24" height="100" fill="#A5B4FC" rx="2" />
                <rect x="260" y="145" width="30" height="75" fill="#C7D2FE" rx="2" />

                {/* Windows on the tallest towers */}
                <g fill="#FFFFFF" opacity="0.55">
                    {[0, 1, 2, 3, 4].map((row) =>
                        [0, 1].map((col) => (
                            <rect
                                key={`w1-${row}-${col}`}
                                x={130 + col * 12}
                                y={105 + row * 18}
                                width="6"
                                height="8"
                                rx="1"
                            />
                        ))
                    )}
                    {[0, 1, 2, 3, 4, 5].map((row) =>
                        [0, 1].map((col) => (
                            <rect
                                key={`w2-${row}-${col}`}
                                x={200 + col * 12}
                                y={82 + row * 18}
                                width="6"
                                height="8"
                                rx="1"
                            />
                        ))
                    )}
                </g>
            </g>

            {/* Factory with smokestack — pollution source */}
            <g>
                <rect x="290" y="175" width="50" height="45" fill="#94A3B8" rx="2" />
                <rect x="300" y="140" width="10" height="40" fill="#94A3B8" rx="1" />
                <rect x="318" y="150" width="10" height="30" fill="#94A3B8" rx="1" />
                {/* Smoke puffs rising from stacks */}
                <circle cx="305" cy="130" r="6" fill="#94A3B8" opacity="0.5">
                    <animate attributeName="cy" values="130;110;130" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="323" cy="140" r="5" fill="#94A3B8" opacity="0.45">
                    <animate attributeName="cy" values="140;118;140" dur="3.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.45;0.1;0.45" dur="3.5s" repeatCount="indefinite" />
                </circle>
            </g>

            {/* Pollution haze overlay */}
            <rect x="0" y="130" width="400" height="90" fill="url(#hazeGrad)" rx="16" />

            {/* Floating particles (animated) */}
            <circle cx="70" cy="60" r="3" fill="#F97316" opacity="0.5">
                <animate attributeName="cy" values="60;50;60" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="40" r="2" fill="#EF4444" opacity="0.4">
                <animate attributeName="cy" values="40;32;40" dur="4.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="220" cy="65" r="2.5" fill="#F97316" opacity="0.45">
                <animate attributeName="cy" values="65;55;65" dur="4.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="90" r="2" fill="#EF4444" opacity="0.35">
                <animate attributeName="cy" values="90;80;90" dur="3.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="110" cy="85" r="2" fill="#F59E0B" opacity="0.4">
                <animate attributeName="cy" values="85;75;85" dur="4.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="250" cy="45" r="1.5" fill="#F97316" opacity="0.5">
                <animate attributeName="cy" values="45;38;45" dur="3.9s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="95" r="2" fill="#EF4444" opacity="0.3">
                <animate attributeName="cy" values="95;87;95" dur="4.1s" repeatCount="indefinite" />
            </circle>

            {/* Ground line */}
            <rect x="0" y="218" width="400" height="4" fill="#E0E7FF" />
        </svg>
    );
}