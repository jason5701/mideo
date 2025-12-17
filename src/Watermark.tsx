import { AbsoluteFill } from 'remotion';
import React from 'react';

export const Watermark: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100, // 맨 위에 표시
        pointerEvents: 'none',
      }}
    >
      <h1
        style={{
          fontFamily: 'sans-serif',
          fontSize: 80,
          color: 'rgba(255, 255, 255, 0.5)', // 반투명 흰색
          transform: 'rotate(-30deg)', // 대각선 기울기
          textShadow: '0 0 10px rgba(0,0,0,0.5)',
          border: '5px solid rgba(255,255,255,0.5)',
          padding: '20px',
        }}
      >
        SAMPLE PREVIEW
      </h1>
    </AbsoluteFill>
  );
};