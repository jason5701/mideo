// src/api/generateText.test.ts
import { generateWeddingText } from "./generateText";
import { httpsCallable } from "firebase/functions";

// Firebase 모듈 전체를 가짜(Mock)로 대체
jest.mock("firebase/functions", () => ({
  getFunctions: jest.fn(),
  connectFunctionsEmulator: jest.fn(),
  httpsCallable: jest.fn(),
}));

describe("결혼식 문구 생성 AI 테스트", () => {
  it("사진 URL을 보내면 AI가 생성한 텍스트를 반환해야 한다", async () => {
    // 1. 가짜 응답 설정 (Mocking)
    const mockResponse = {
      data: { success: true, text: "두 사람의 설레는 시작" },
    };
    const mockCallable = jest.fn().mockResolvedValue(mockResponse);
    (httpsCallable as jest.Mock).mockReturnValue(mockCallable);

    // 2. 함수 실행
    const result = await generateWeddingText("http://fake-url.com/photo.jpg");

    // 3. 검증 (Assert)
    expect(httpsCallable).toHaveBeenCalled(); // 함수가 호출되었는가?
    expect(mockCallable).toHaveBeenCalledWith({
      photoUrl: "http://fake-url.com/photo.jpg",
    }); // 올바른 파라미터를 넘겼는가?
    expect(result).toBe("두 사람의 설레는 시작"); // 결과가 예상과 같은가?
  });

  it("서버 에러가 나면 기본 문구를 반환해야 한다", async () => {
    // 1. 에러 상황 설정
    const mockCallable = jest
      .fn()
      .mockRejectedValue(new Error("Network Error"));
    (httpsCallable as jest.Mock).mockReturnValue(mockCallable);

    // 2. 함수 실행
    const result = await generateWeddingText("http://error-url.com");

    // 3. 검증
    expect(result).toContain("(AI 오류)"); // 에러 발생 시 기본 문구가 나오는지 확인
  });
});
