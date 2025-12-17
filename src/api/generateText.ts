import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

// ... (타입 정의는 기존과 동일) ...
export type ImgEffectType =
  | "cinematic_slow_zoom"
  | "dynamic_pan_rotate"
  | "split_screen_reveal"
  | "vintage_film_story"
  | "bokeh_overlay_dream"
  | "static_elegant";
export type TextEffectType =
  | "fade_up_slow"
  | "typewriter"
  | "elegant_scale"
  | "blur_reveal";
export type TextPositionType =
  | "bottom_center"
  | "top_left"
  | "top_right"
  | "bottom_left"
  | "bottom_right"
  | "middle_center";

export interface SceneData {
  originalUrl: string;
  text: string;
  img_effect: ImgEffectType;
  text_effect: TextEffectType;
  text_position: TextPositionType;
  duration: number;
}

interface RequestData {
  photoUrls: string[];
  userPrompt?: string; // ★ [추가] 사용자의 요청사항 (선택값)
}
interface BackendResponse {
  success: boolean;
  data: SceneData[];
}

// 함수 인자에 userPrompt 추가
export const generateWeddingPlan = async (
  photoUrls: string[],
  userPrompt?: string,
): Promise<SceneData[]> => {
  try {
    const analyzePhoto = httpsCallable<RequestData, BackendResponse>(
      functions,
      "analyzePhoto",
    );

    // 백엔드로 사진과 프롬프트를 같이 보냄
    const result = await analyzePhoto({ photoUrls, userPrompt });

    if (result.data?.success && Array.isArray(result.data.data)) {
      return result.data.data;
    }
    throw new Error("데이터 형식 오류");
  } catch (error) {
    console.error("AI 기획 실패:", error);
    throw error;
  }
};
