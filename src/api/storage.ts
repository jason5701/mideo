// src/api/storage.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * 사용자가 선택한 파일을 Firebase Storage에 업로드하고,
 * 전 세계 어디서든 볼 수 있는 URL을 반환하옵니다.
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // 1. 파일 이름 중복 방지를 위해 시간값을 붙임 (예: 17123456_myphoto.jpg)
    const uniqueName = `${Date.now()}_${file.name}`;

    // 2. 저장할 경로 설정 (uploads 폴더 아래)
    const storageRef = ref(storage, `uploads/${uniqueName}`);

    // 3. 업로드 수행
    const snapshot = await uploadBytes(storageRef, file);
    console.log("업로드 성공:", snapshot);

    // 4. 다운로드 URL 획득
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("업로드 실패:", error);
    throw new Error("사진을 곳간에 넣지 못했사옵니다.");
  }
};
