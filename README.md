# Smart Infrastructure Lab

연세대학교 스마트인프라연구실 홈페이지의 HTML5 UP Story 기반 개편입니다. 기존 국문·영문 콘텐츠와 공개 주소를 유지하며, JSON과 Markdown에서 정적 페이지를 생성합니다.

- 미리보기 작업 브랜치: `redesign/story`
- 원본 저장소: <https://github.com/hongjo/hongjo.github.io>
- 포크: <https://github.com/SH-Joo/hongjo.github.io>
- 구현 계획: [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md)
- 검토·수정 기록: [docs/REVIEW-LOG.md](docs/REVIEW-LOG.md)
- 콘텐츠 수정 방법: [WEBSITE-EDITING.md](WEBSITE-EDITING.md)

## 실행

Node.js 22 이상에서 실행합니다. Windows PowerShell에서 실행 정책이 npm 스크립트를 막으면 `npm` 대신 `npm.cmd`를 사용할 수 있습니다.

```sh
npm ci
npm run build
npm run check
npm run dev
```

VS Code의 Go Live를 켜면 <http://127.0.0.1:5500/>에서 볼 수 있습니다. 루트 `index.html`이 `_site/ko/` 홈으로 연결합니다. `npm run dev`를 실행한 동안 원본을 저장하면 자동으로 다시 빌드하고 Go Live가 화면을 갱신합니다. 화면을 직접 여는 조작은 필요하지 않습니다.

`_site/`가 배포 결과물이며 본문 HTML은 템플릿과 렌더링 코드에서 생성됩니다. 이전 배포의 루트 HTML·CSS·JavaScript는 제거했고 루트에는 Go Live용 시작 파일을 두었습니다. 별도 서버가 필요할 때는 `npm run preview`로 <http://127.0.0.1:4173/_site/>에서 확인할 수 있습니다.

## 검사

```sh
npm run check:preservation
npm run test:browser
```

`check:preservation`은 이번 개편에서 원본 208개와 사용자 제공 이미지·설명 9개 파일이 바뀌지 않았는지 검증하는 이관 전용 검사입니다. 평상시 콘텐츠 추가·수정에는 `check`를 사용합니다. `check`는 현재 JSON에서 페이지·논문·구성원·과제·강의·사진 수를 계산해 결과와 대조합니다.

브라우저 검사는 Windows의 Chrome을 기본 사용합니다. CI에서는 Playwright Chromium을 설치하며, Linux에서 로컬 검사하려면 `npx playwright install chromium`을 먼저 실행하고 `CI=1` 또는 `PLAYWRIGHT_CHANNEL=chromium`으로 실행할 수 있습니다. 검사는 검색·연도·분류·주제·주소 복원·한영 전환·모바일 메뉴·원본 확대·접근성·본문 보존과 네 가지 화면 폭을 포함합니다. 결과와 캡처는 `test-results/`에 저장합니다.

## 배포 주소

`SITE_URL`은 도메인, `BASE_PATH`는 저장소 경로 접두사입니다. 로컬 기본값은 Go Live용 `http://127.0.0.1:5500`과 `/_site`입니다. GitHub Actions에서는 실제 배포 주소를 명시해 빌드합니다. 개인 포크용 빌드를 별도로 검사하려면 다음처럼 실행합니다. Go Live에서 다시 보려면 `npm run dev`를 실행합니다.

```powershell
$env:SITE_URL = 'https://sh-joo.github.io'
$env:BASE_PATH = '/hongjo.github.io'
$env:PREVIEW = 'true'
npm.cmd run build
npm.cmd run check
npm.cmd run preview
```

GitHub Actions가 실제 소유자와 저장소 이름에서 이 값을 자동 계산합니다. 포크는 검색엔진에 중복 사이트로 노출되지 않도록 noindex를 적용합니다. `SH-Joo/hongjo.github.io`의 `redesign/story`에서는 빌드와 브라우저 검사를 실행하고 결과물을 보관합니다. 현재 미리보기는 로컬 Go Live로 확인합니다. 기존 `master`와 `add-jimin-yu` 브랜치는 유지합니다. GitHub Pages 게시 단계는 `master`·`main` 또는 수동 실행에만 연결되어 있으며, 게시하려면 저장소의 Pages 설정을 먼저 구성해야 합니다. 교수님 저장소의 운영 반영은 별도의 변경 검토로 진행할 수 있습니다.

## 이미지

사용자가 제공한 이미지 8장의 역할은 [image_prompts.txt](image_prompts.txt), 실제 배치는 `data/imagery.json`에 정의했습니다. 원본은 `AI_generated_images/`에 보존합니다. 기존 구성원·연구 도식·앨범 사진은 `img/`에 보존하며 빌드가 반응형 WebP를 생성합니다.

## 디자인 출처

[Story by HTML5 UP](https://html5up.net/story)를 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)에 따라 연구실 사이트에 맞게 수정했습니다. 템플릿 라이선스와 설명은 `assets/story/`에 있으며 디자인 크레딧은 사이트 푸터에도 표시합니다.
