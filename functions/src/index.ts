import * as functions from "firebase-functions";
import OpenAI from "openai";

interface AnalyzeRequestData {
  photoUrls: string[];
  userPrompt?: string; // 사용자 요청 사항
}

// ... (AiSceneResult 인터페이스 등은 기존과 동일) ...

const findSceneArray = (obj: any): any[] => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  if (typeof obj === "object") {
    if (Array.isArray(obj.scenes)) return obj.scenes;
    if (Array.isArray(obj.data)) return obj.data;
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key]) && obj[key].length > 0) return obj[key];
    }
  }
  return [];
};

export const analyzePhoto = functions.https.onCall(
  async (
    request: functions.https.CallableRequest<AnalyzeRequestData>,
  ): Promise<any> => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { photoUrls, userPrompt } = request.data;

    if (!photoUrls || photoUrls.length === 0) {
      throw new functions.https.HttpsError("invalid-argument", "사진 없음");
    }

    // 사용자 요청이 없으면 기본 '감동' 컨셉 적용
    const finalPrompt =
      userPrompt && userPrompt.trim().length > 0
        ? userPrompt
        : "두 사람의 소소한 일상에서 시작해, 깊어지는 사랑, 그리고 결혼이라는 감동적인 결말을 맺는 정석적인 웨딩 스토리를 만들어줘.";

    const imageContents = photoUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url: url },
    }));

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `당신은 세계적인 영화 시나리오 작가이자 웨딩 영상 총괄 감독입니다.
          단순히 사진을 설명하는 캡션을 달면 해고됩니다.
          사진들을 연결하여 **"하나의 완결된 이야기(Storyline)"**를 창작해야 합니다.

          **[작업 지침]**
          1. **전체 서사 구조 (Narrative Arc):**
             - 제공된 사진들을 서사를 만들어 이야기처럼 순서를 배치해줘.
             - 사진이 섞여 있어도 당신이 맥락을 파악하여 시간 순서나 감정선에 맞게 정렬해야 합니다.

          2. **자막 작성 규칙 (Copywriting):**
             - **절대 사진을 묘사하지 마세요.** (예: "햄버거를 먹는 모습" -> 금지 ❌)
             - **사진 속 감정과 의미를 해석하세요.** (예: "화려한 식사보다, 함께 먹는 햄버거가 더 좋았습니다." -> 합격 ⭕)
             - 자막들은 서로 이어져야 합니다. 한 편의 시(Poem)나 편지처럼 읽혀야 합니다.

          3. **사용자 요청 반영:**
             - 사용자가 요구한 컨셉: "${finalPrompt}"
             - 이 컨셉을 충실히 반영하여 어조(Tone & Manner)를 결정하세요. (예: 유머러스하게 해달라고 하면 장난스러운 멘트로)

          4. **기술적 지시:**
             - 일상 사진: text_position='middle_center' 또는 'bottom_center', text_effect='typewriter'
             - 감동적인 사진: text_position='bottom_center', text_effect='fade_up_slow'
             - img_effect는 사진 분위기에 맞춰 다양하게 섞으세요.
          
          5. **출력 형식:**
             - 반드시 JSON 객체로 반환하며, 'scenes' 배열 안에 객체들을 담으세요.
             - { originalUrl, text, img_effect, text_effect, text_position, duration }`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `요청사항: "${finalPrompt}"\n이 사진들을 재배치하여 기승전결이 있는 감동적인 영상 스토리보드를 짜줘.`,
              },
              ...imageContents,
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content || "{}");
      let scenes = findSceneArray(parsed);

      if (scenes.length === 0) throw new Error("배열 파싱 실패");

      // 데이터 보정
      scenes = scenes.map((s, index) => ({
        originalUrl: s.originalUrl || photoUrls[index] || "",
        text: s.text || "...",
        img_effect: s.img_effect || "static_elegant",
        text_effect: s.text_effect || "fade_up_slow",
        text_position: s.text_position || "bottom_center",
        duration: s.duration || 4,
      }));

      return { success: true, data: scenes };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "알 수 없는 오류";
      console.error("AI 감독 오류:", msg);
      throw new functions.https.HttpsError("internal", msg);
    }
  },
);
