import React from 'react';

type WsLogoProps = {
  className?: string;
  size?: number;
  textColor?: string;
  goldColor?: string;
};

export default function WsLogo({
  className = 'ws-logo-svg',
  size = 96,
  textColor = '#FFFFFF',
  goldColor = '#DFC18B',
}: WsLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waseem Cafe Logo"
    >
      {/* 3 Coffee leaves */}
      <g fill={goldColor}>
        {/* Center leaf */}
        <path d="M50 12 C46 22 47.5 30 50 34 C52.5 30 54 22 50 12 Z" />
        {/* Left leaf */}
        <path d="M48 27 C40 21 31 24 30 30 C35 32 43 32 48 29 Z" />
        {/* Right leaf */}
        <path d="M52 27 C60 21 69 24 70 30 C65 32 57 32 52 29 Z" />
        {/* Center dot */}
        <circle cx="50" cy="35" r="2.2" />
      </g>
      {/* WS Monogram */}
      <text
        x="50"
        y="65"
        fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
        fontSize="31"
        fontWeight="700"
        fill={textColor}
        textAnchor="middle"
        letterSpacing="2"
      >
        WS
      </text>
      {/* Underline ornament */}
      <line x1="32" y1="71" x2="68" y2="71" stroke={goldColor} strokeWidth="2" strokeLinecap="round" />
      {/* Tagline */}
      <text
        x="50"
        y="83"
        fontFamily="'DM Sans', sans-serif"
        fontSize="7"
        fontWeight="600"
        fill={goldColor}
        textAnchor="middle"
        letterSpacing="2"
      >
        GOOD COFFEE
      </text>
      <text
        x="50"
        y="92"
        fontFamily="'DM Sans', sans-serif"
        fontSize="7"
        fontWeight="600"
        fill={goldColor}
        textAnchor="middle"
        letterSpacing="2"
      >
        BETTER DAYS
      </text>
    </svg>
  );
}
