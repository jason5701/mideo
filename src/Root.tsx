// // src/Root.tsx
// import { Composition } from "remotion";
// import { MyComposition, myCompSchema } from "./Composition";
// import React from "react";
// import "./style.css";

// export const RemotionRoot: React.FC = () => {
//   return (
//     <>
//       <Composition
//         id="WeddingVideo"
//         component={MyComposition}
//         // ▼ 30초 설정 (30fps * 30s = 900)
//         durationInFrames={900}
//         fps={30}
//         width={1920}
//         height={1080}
//         schema={myCompSchema}
//         defaultProps={{
//   scenes: [
//     {
//       url: "https://via.placeholder.com/1920x1080",
//       text: "기본 자막",
//       duration: 3
//     }
//   ],
//   isPremium: false,
// }}
//       />
//     </>
//   );
// };
