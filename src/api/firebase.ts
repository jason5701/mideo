// src/api/firebase.ts
import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage } from "firebase/storage";

// 환경변수 검증 (키가 없으면 에러를 뿜어 실수를 방지함)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (!apiKey) {
  throw new Error("No Firebase Api Key.");
}
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 1. 앱 초기화
const app = initializeApp(firebaseConfig);

// 2. Functions 인스턴스 가져오기
export const functions = getFunctions(app);

export const storage = getStorage(app);

// 3. 개발 모드일 때만 로컬 에뮬레이터 연결
// (배포 시에는 자동으로 프로덕션 서버를 보게 됨)
if (import.meta.env.DEV) {
  console.log("connected to Functions Emulator");
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  // ▼ 2. (선택사항) Storage도 에뮬레이터를 쓴다면 연결.
  // 일단은 실서버 Storage를 쓰는 게 확인하기 편하므로 주석 처리 해두겠나이까.
  // connectStorageEmulator(storage, "127.0.0.1", 9199);
}
