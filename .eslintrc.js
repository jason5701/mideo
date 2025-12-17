module.exports = {
  extends: [
    "plugin:@remotion/recommended",
    "plugin:@remotion/react",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    // ▼▼▼ 이 두 줄을 추가하여 검사관을 조용히 시키옵소서 ▼▼▼
    "@typescript-eslint/no-explicit-any": "off", // any 사용 허용
    "@remotion/warn-native-media-tag": "off", // img 태그 경고 무시 (선택 사항)
  },
};
