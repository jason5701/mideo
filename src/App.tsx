import React, { useState } from "react";
import { Player } from "@remotion/player";
import { Img } from "remotion";
import { MyComposition } from "./Composition";
import { generateWeddingPlan, SceneData } from "./api/generateText";
import { TEST_PHOTOS } from "./dummy";

// ... (Scene 인터페이스와 TEST_PHOTOS는 기존 그대로 유지) ...
interface Scene {
  url: string;
  text: string;
  img_effect: string;
  text_effect: string;
  text_position: string;
  duration: number;
}

const createInitialScenes = (urls: string[]): Scene[] => {
  return urls.map((url) => ({
    url,
    text: "",
    img_effect: "static_elegant",
    text_effect: "fade_up_slow",
    text_position: "bottom_center",
    duration: 3,
  }));
};

const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(
    createInitialScenes(TEST_PHOTOS),
  );
  const [isPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<string>("준비됨");

  // ★ [추가] 사용자의 요구사항을 담을 상태
  const [userPrompt, setUserPrompt] = useState<string>("");

  const calculatedDuration = scenes.reduce(
    (acc, scene) => acc + scene.duration * 30,
    0,
  );
  const totalFrames = Math.max(30, calculatedDuration);

  const handleAiDirector = async () => {
    if (loading) return;
    setLoading(true);
    setAiStatus("AI 작가가 님의 사연을 바탕으로 시나리오 집필 중...");

    try {
      const currentUrls = scenes.map((s) => s.url);

      // ★ [변경] userPrompt를 함께 전달
      const aiPlan: SceneData[] = await generateWeddingPlan(
        currentUrls,
        userPrompt,
      );

      if (!aiPlan || aiPlan.length === 0) throw new Error("AI 응답 없음");

      const newScenes: Scene[] = aiPlan.map((item) => ({
        url: item.originalUrl || item.url,
        text: item.text || " ",
        img_effect: item.img_effect || "static_elegant",
        text_effect: item.text_effect || "fade_up_slow",
        text_position: item.text_position || "bottom_center",
        duration: item.duration || 4,
      }));

      if (newScenes.length === 0) throw new Error("매핑 실패");

      setScenes(newScenes);
      setAiStatus(`시나리오 완성! "${userPrompt || "기본 감동 컨셉"}" 반영됨.`);
    } catch (error) {
      console.error(error);
      setAiStatus("집필 실패. 다시 시도해주시옵소서.");
      alert("오류가 발생했사옵니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "40px",
        maxWidth: "1000px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ color: "#333" }}>🎬 AI 웨딩 시네마 (Storytelling Ver.)</h1>

        {/* ★ [추가] 사용자 요구사항 입력 영역 */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 20px auto",
            textAlign: "left",
          }}
        >
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "8px",
            }}
          >
            ✍️ AI 작가에게 원하는 컨셉을 말해주세요:
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="예시: 우리는 먹는 걸 좋아하는 커플이야. 유머러스하게 시작해서 마지막엔 감동적으로 끝내줘. / 예시: 너무 오글거리지 않고 담백하고 세련된 문체로 부탁해."
            style={{
              width: "100%",
              height: "80px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
              fontFamily: "sans-serif",
            }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <p style={{ color: "#666", fontWeight: "bold", fontSize: "14px" }}>
            {aiStatus}
          </p>
          <button
            onClick={handleAiDirector}
            disabled={loading}
            style={{
              padding: "15px 40px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: loading ? "#ccc" : "#E91E63",
              color: "white", // 색상 변경 (로맨틱 핑크)
              border: "none",
              borderRadius: "30px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(233, 30, 99, 0.4)",
              transition: "transform 0.2s",
            }}
          >
            {loading
              ? "🎞️ 시나리오 쓰는 중..."
              : "✨ 나만의 웨딩 스토리 만들기"}
          </button>
        </div>

        {/* 씬 리스트 미리보기 */}
        <div
          style={{
            display: "flex",
            gap: "5px",
            overflowX: "auto",
            padding: "10px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          {scenes.map((scene, i) => (
            <div
              key={i}
              style={{
                minWidth: "90px",
                fontSize: "10px",
                textAlign: "center",
              }}
            >
              <Img
                src={scene.url}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {scene.text}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* 플레이어 */}
      <div
        style={{
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "4px solid #333",
          backgroundColor: "#000",
        }}
      >
        <Player
          component={MyComposition}
          durationInFrames={totalFrames}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          controls
          style={{ width: "100%", aspectRatio: "16/9" }}
          inputProps={{ scenes, isPremium }}
        />
      </div>
    </div>
  );
};

export default App;
