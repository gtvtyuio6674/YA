import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "./api/custom-fetch";

// GitHub Pages 배포 시 실제 백엔드 API 주소를 설정하거나, 
// 로컬 테스트 시에는 빈 값을 유지합니다.
// 만약 백엔드가 없다면 목업(Mock) 데이터를 사용하도록 수정이 필요할 수 있습니다.
const API_URL = import.meta.env.VITE_API_URL || "";
setBaseUrl(API_URL);

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
