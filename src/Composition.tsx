import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  interpolate,
  Sequence,
  useVideoConfig,
  Audio,
} from "remotion";
import { Watermark } from "./Watermark";
import { z } from "zod";

// 타입 정의 (App.tsx와 공유하면 좋으나 편의상 재정의)
const SceneSchema = z.object({
  url: z.string(),
  text: z.string(),
  img_effect: z.string(), // Zod는 string으로 받아도 무방 (내부에서 처리)
  text_effect: z.string(),
  text_position: z.string(),
  duration: z.number(),
});

export const myCompSchema = z.object({
  scenes: z.array(SceneSchema),
  isPremium: z.boolean(),
});

// --------------------------------------------------------
// 🖼️ [이미지 효과] Image Layer (기존 코드 유지 및 간소화)
// --------------------------------------------------------
const ImageLayer = ({ scene, frame, durationInFrames }: any) => {
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  const wrapperStyle: React.CSSProperties = {};

  // 1. 시네마틱 줌
  if (scene.img_effect === "cinematic_slow_zoom") {
    const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.25]);
    style.transform = `scale(${scale})`;
  }
  // 2. 다이내믹 팬
  else if (scene.img_effect === "dynamic_pan_rotate") {
    const x = interpolate(frame, [0, durationInFrames], [0, -30]);
    const rot = interpolate(frame, [0, durationInFrames], [-1, 1]);
    style.transform = `scale(1.15) translateX(${x}px) rotate(${rot}deg)`;
  }
  // 3. 빈티지 필름
  else if (scene.img_effect === "vintage_film_story") {
    style.filter = "grayscale(100%) sepia(20%) contrast(1.1)";
    const flicker = Math.sin(frame * 0.8) * 0.05 + 0.95;
    style.opacity = flicker;
  }
  // 4. 보케 드림
  else if (scene.img_effect === "bokeh_overlay_dream") {
    const blur = interpolate(frame, [0, 20], [10, 0], {
      extrapolateRight: "clamp",
    });
    style.filter = `blur(${blur}px)`;
    style.transform = `scale(1.05)`;
  }
  // 5. 스플릿 (생략 - 기본 줌으로 대체 가능하거나 위 코드 복붙)
  else {
    // static_elegant
    style.transform = `scale(1.0)`;
  }

  return (
    <AbsoluteFill
      style={{ overflow: "hidden", backgroundColor: "#000", ...wrapperStyle }}
    >
      <Img src={scene.url} style={style} />
      {/* 빈티지 오버레이 예시 */}
      {scene.img_effect === "vintage_film_story" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(100,50,0,0.1)",
            mixBlendMode: "overlay",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// --------------------------------------------------------
// ✍️ [텍스트 효과] Text Layer (위치/타이밍/애니메이션 총괄)
// --------------------------------------------------------
const TextLayer = ({ scene, frame, durationInFrames }: any) => {
  // 1. 텍스트 등장 타이밍 (이미지보다 0.5초 늦게 시작해서 시선 분산 방지)
  const delay = 15; // 0.5초 (30fps 기준)
  const textFrame = frame - delay; // 텍스트 전용 프레임

  // 아직 등장 시간 안 됐으면 렌더링 안 함
  if (textFrame < 0) return null;

  // 2. 위치 결정 (CSS Position)
  let posStyle: React.CSSProperties = {
    position: "absolute",
    padding: "40px",
    textAlign: "center",
    width: "auto",
    maxWidth: "80%",
  };

  switch (scene.text_position) {
    case "top_left":
      posStyle = { ...posStyle, top: 40, left: 40, textAlign: "left" };
      break;
    case "top_right":
      posStyle = { ...posStyle, top: 40, right: 40, textAlign: "right" };
      break;
    case "bottom_left":
      posStyle = { ...posStyle, bottom: 80, left: 40, textAlign: "left" };
      break;
    case "bottom_right":
      posStyle = { ...posStyle, bottom: 80, right: 40, textAlign: "right" };
      break;
    case "middle_center":
      posStyle = {
        ...posStyle,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
      break;
    default:
      posStyle = {
        ...posStyle,
        bottom: 80,
        left: 0,
        right: 0,
        margin: "0 auto",
      }; // bottom_center
  }

  // 3. 애니메이션 효과 (Opacity & Transform)
  let animStyle: React.CSSProperties = { opacity: 1 };
  let innerText = scene.text;

  // (A) 서서히 위로 등장 (Fade Up)
  if (scene.text_effect === "fade_up_slow") {
    const opacity = interpolate(textFrame, [0, 20], [0, 1], {
      extrapolateRight: "clamp",
    });
    const y = interpolate(textFrame, [0, 20], [20, 0], {
      extrapolateRight: "clamp",
    });
    animStyle = { opacity, transform: `translateY(${y}px)` };
  }
  // (B) 타자기 효과 (Typewriter)
  else if (scene.text_effect === "typewriter") {
    const textLength = scene.text.length;
    // 글자당 2프레임씩
    const currentLength = interpolate(
      textFrame,
      [0, textLength * 3],
      [0, textLength],
      { extrapolateRight: "clamp" },
    );
    innerText = scene.text.substring(0, Math.round(currentLength));
    // 커서 효과 추가
    if (Math.round(currentLength) < textLength && textFrame % 10 < 5)
      innerText += "|";
  }
  // (C) 우아한 확대 (Elegant Scale)
  else if (scene.text_effect === "elegant_scale") {
    const opacity = interpolate(textFrame, [0, 25], [0, 1]);
    const scale = interpolate(textFrame, [0, 25], [0.9, 1]);
    animStyle = { opacity, transform: `scale(${scale})` };
  }
  // (D) 블러 리빌 (Blur Reveal)
  else if (scene.text_effect === "blur_reveal") {
    const opacity = interpolate(textFrame, [0, 15], [0, 1]);
    const blur = interpolate(textFrame, [0, 15], [10, 0]);
    animStyle = { opacity, filter: `blur(${blur}px)` };
  }

  // 4. 공통 퇴장 효과 (마지막 0.5초)
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
  );

  return (
    <div style={{ ...posStyle, opacity: exitOpacity }}>
      <h2
        style={{
          fontFamily: '"Nanum Myeongjo", serif',
          fontSize: scene.text_position === "middle_center" ? 70 : 50, // 중앙이면 더 크게
          color: "white",
          fontWeight: 600,
          textShadow: "0 4px 20px rgba(0,0,0,0.8)", // 배경이 밝아도 보이게 그림자 강화
          margin: 0,
          whiteSpace: "pre-wrap",
          ...animStyle, // 애니메이션 적용
        }}
      >
        {innerText}
      </h2>
    </div>
  );
};

// --------------------------------------------------------
// 🎬 메인 컴포넌트
// --------------------------------------------------------
const SceneRenderer = ({ scene }: any) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationInFrames = scene.duration * fps;

  // 전체 페이드 인/아웃 (씬 전환)
  const masterOpacity = interpolate(
    frame,
    [0, 10, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0],
  );

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      {/* 1. 이미지 레이어 */}
      <ImageLayer
        scene={scene}
        frame={frame}
        durationInFrames={durationInFrames}
      />

      {/* 2. 시네마틱 레터박스 (영화 느낌) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8%",
          background: "black",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "8%",
          background: "black",
          zIndex: 5,
        }}
      />

      {/* 3. 텍스트 레이어 (독립된 타이밍/위치) */}
      <AbsoluteFill style={{ zIndex: 10 }}>
        <TextLayer
          scene={scene}
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MyComposition = ({ scenes, isPremium }: any) => {
  const { fps } = useVideoConfig();
  let accumulatedFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio
        src="https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3"
        volume={0.3}
        loop
      />

      {scenes.map((scene: any, index: number) => {
        const startFrame = accumulatedFrames;
        const durationInFrames = scene.duration * fps;
        accumulatedFrames += durationInFrames;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <SceneRenderer scene={scene} />
          </Sequence>
        );
      })}

      {!isPremium && <Watermark />}
    </AbsoluteFill>
  );
};
