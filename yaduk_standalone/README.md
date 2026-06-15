# 야덕연구소 (Yaduk Lab) - Standalone

이 프로젝트는 기존 야덕연구소 프로젝트에서 프론트엔드 부분을 분리하여 단독으로 실행 및 GitHub Pages에 배포할 수 있도록 구성된 버전입니다.

## 주요 변경 사항

1.  **단독 프로젝트 구성**: `pnpm workspace` 기반에서 단독 `npm` 프로젝트로 변경되었습니다.
2.  **API 클라이언트 내장**: 외부 라이브러리에 의존하던 API 클라이언트를 `src/api` 폴더로 내장하였습니다.
3.  **GitHub Pages 최적화**: `vite.config.ts`에서 상대 경로(`base: "./"`)를 사용하도록 설정되어 있어, GitHub Pages의 서브 디렉토리에서도 바로 작동합니다.
4.  **GitHub Actions 포함**: `.github/workflows/deploy.yml` 파일이 포함되어 있어, GitHub 저장소에 올리고 Pages 설정을 활성화하면 자동으로 배포됩니다.

## 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## GitHub 배포 방법

1.  GitHub에 새 저장소를 만듭니다.
2.  이 프로젝트 파일들을 업로드합니다.
3.  저장소 설정(`Settings`) -> `Pages`에서 `Build and deployment` -> `Source`를 `GitHub Actions`로 변경합니다.
4.  `main` 브랜치에 푸시하면 자동으로 배포가 시작됩니다.

## 참고 사항

*   현재 이 프론트엔드는 백엔드 API 서버를 필요로 합니다. `src/main.tsx`에서 `API_URL`을 실제 서버 주소로 설정하거나, 환경 변수 `VITE_API_URL`을 사용하세요.
*   백엔드가 없는 경우, 대부분의 데이터 조회 기능이 작동하지 않을 수 있습니다.
