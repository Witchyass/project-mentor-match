import React from 'react';

const Logo = ({ size = 32, showText = true, color = '#1e3a8a' }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg
                width={size * 1.5}
                height={size}
                viewBox="0 0 44 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
            >
                {/* Right Loop (Dark Blue) */}
                <path
                    d="M32 4C37.5228 4 42 8.47715 42 14C42 19.5228 37.5228 24 32 24C26.4772 24 22 19.5228 22 14C22 12.5 22.4 11.1 23.1 10"
                    stroke="#0a215e"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                {/* Left Loop (Primary Blue) */}
                <path
                    d="M12 20C6.47715 20 2 15.5228 2 10C2 4.47715 6.47715 0 12 0C17.5228 0 22 4.47715 22 10C22 11.5 21.6 12.9 20.9 14"
                    stroke="#1e3a8a"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                {/* Connection Overlap */}
                <path
                    d="M22 10C22 11.5 21.6 12.9 20.9 14"
                    stroke="#1e3a8a"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
            {showText && (
                <span style={{
                    fontSize: `${size * 0.75}px`,
                    fontWeight: 900,
                    color: color,
                    letterSpacing: '-0.02em',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                    MentorMatch
                </span>
            )}
        </div>
    );
};

export default Logo;
