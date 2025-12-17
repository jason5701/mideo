// src/components/Watermark.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const Watermark: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100, // 다른 요소보다 무조건 위에 배치
        pointerEvents: 'none', // 클릭 통과 (사용자 경험 저해 방지)
      }}
    >
      <h1
        style={{
          fontFamily: 'Helvetica, Arial',
          fontSize: 100,
          color: 'rgba(255, 255, 255, 0.3)', // 흰색 반투명
          transform: 'rotate(-45deg)', // 대각선으로 비스듬하게
          textShadow: '0 0 10px rgba(0,0,0,0.5)', // 잘 보이도록 그림자 추가
        }}
      >
        PREVIEW / SAMPLE
      </h1>
    </AbsoluteFill>
  );
};