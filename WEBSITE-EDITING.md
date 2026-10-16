# 연구실 홈페이지 수정 안내

개인 포크 공개 주소: https://sh-joo.github.io/hongjo.github.io/

기존 연구실 주소: https://hongjo.github.io/

## 콘텐츠 수정

- 국문·영문 데이터: `data/ko/`, `data/en/`
- 대학원 모집 안내: 각 언어의 `admissions.json`
- 학기별 수업: 각 언어의 `teaching.json` (`semesters` 맨 앞이 최신 학기)
- 구성원: 각 언어의 `members.json` — 두 언어의 명단을 함께 수정
- 논문 목록: `data/ko/publications.json` (양쪽 언어에서 같은 목록 사용)
- 대표 연구 요약: `data/research.json`
- 블로그 목록: 각 언어의 `blog.json`, 본문: `blog/ko/`, `blog/en/`의 Markdown
- 사진 원본: `img/` — 빌드 시 반응형 WebP를 자동 생성하며 원본은 확대용으로 유지
- 홈의 히어로·연구분야 문구: `data/presentation.json`
- 화면 설명용 이미지 배치와 대체 텍스트: `data/imagery.json`, 이미지 원본: `AI_generated_images/`
- 디자인과 동작: `assets/lab.css`, `assets/site.js` — Story 원본 스타일은 `assets/story/`
- 페이지 내용 렌더링: `scripts/render.mjs`, 공통 HTML: `templates/page.html`
- 빌드·경로·반응형 이미지: `scripts/build.mjs`, `scripts/config.mjs`, `scripts/images.mjs`

미공개 논문 파일은 별도로 추가하지 않았습니다. 모집 안내의 2년 지원 프로그램은 2026년 9월 기준으로 명시했습니다. 변동 시 해당 안내를 갱신해 주세요.

## 로컬 확인 및 배포

Node.js 22 이상에서:

```sh
npm ci
npm run build
npm run check
npm run dev
```

Go Live(5500 포트)에서 프로젝트 루트의 `index.html`을 열면 최신 `_site/` 영어 화면으로 연결됩니다. `npm run dev`는 원본 저장을 감지해 자동으로 다시 빌드합니다. `_site/`가 배포용 결과물입니다. 개인 포크의 `redesign/story`에서는 GitHub Actions가 빌드·검증 후 결과물을 보관합니다. 공개 반영은 [Build and publish lab website](https://github.com/SH-Joo/hongjo.github.io/actions/workflows/site.yml)의 **Run workflow**에서 `redesign/story`를 선택해 실행합니다. 빌드와 브라우저 검사를 모두 통과하면 설정된 개인 포크의 Pages에 게시됩니다. 배포 기록은 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)에서 확인합니다.

수정할 원본은 위의 JSON/Markdown/템플릿입니다. 생성된 `_site/` HTML은 직접 수정하지 마세요. 이전 배포의 루트 HTML·CSS·JavaScript는 제거했고 Git 기록에서 확인할 수 있습니다.

논문은 최신 연도부터 묶어 표시합니다. 검색창은 제목·저자·출처·연도를 검색하고, 연도 선택과 전체/저널/국제학회/국내학회/특허 버튼 및 보조 주제 필터를 조합할 수 있습니다. Selected 기능은 사용하지 않습니다. 건수와 연도 선택지는 데이터에서 자동 계산됩니다.

일반 `npm run check`는 현재 데이터와 결과물을 비교하므로 새 논문·구성원·글을 추가해도 사용할 수 있습니다. `npm run check:preservation`은 2026-10-16 개편 이관 시 원본 파일이 그대로인지 확인하는 별도 검사이며, 이후 의도적인 콘텐츠 수정에는 사용하지 않습니다. 브라우저 회귀 검사는 `npm run test:browser`입니다. 배포 경로와 포크의 로컬 미리보기는 README.md를 참고하세요.

유지민 학생 추가와 Siheon Joo의 소개·사진·표기 수정은 사용자 요청에 따라 `scripts/content-amendments.json`에 원본/수정 해시를 기록했습니다. 사진은 `img/member/student/jimin-yu.png`와 `siheon-joo.jpg`, 소개는 한영 members.json에서 수정합니다. 다른 구성원 데이터는 유지합니다. 논문의 저자 선택은 현재 학생·Alumni·외부인사를 구분하고, 교수님은 별도 항목으로 표시합니다. 저자 조건도 연도·주제·분류·검색 조건과 함께 주소에 보존합니다.

홈의 큰 슬로건·소개 카피는 한국어 화면에서도 영어를 사용합니다. 한국어 본문·구성원 소개·논문·게시글은 해당 언어를 유지합니다. 한국어 폰트는 `assets/fonts/noto-serif-kr.css`의 Noto Serif KR입니다. 홈의 섹션·점 내비게이션은 render.mjs의 home(), 사진 자동 배치와 활동 선택은 site.js의 albumBrowser 구간에서 관리합니다.

### 구성원의 Research & background

행정 담당을 제외한 모든 구성원은 연구 및 상세 소개, Publications, Patents 항목을 갖습니다. 논문·특허는 `data/ko/publications.json`의 저자·발명자 이름을 기준으로 자동 연결되므로 실적을 각 구성원에게 중복 입력할 필요가 없습니다. 실적이 등록되지 않은 경우에는 홈페이지에 등록된 항목이 없다는 안내가 표시됩니다.

국·영문 이름과 확인된 영문 철자 변형은 `data/member-author-aliases.json`에서 관리합니다. 이니셜이나 유사한 이름만으로 연결하지 말고, 동일 인물임을 확인한 이름만 추가하세요. `data/en/members.json`과 `data/ko/members.json`의 `details`는 경력·연구 소개이며, 연구실 전체 목록에 없는 개인 논문·학회 발표는 `additionalPublications` 배열에 기록할 수 있습니다. 특허의 출원·등록 구분과 번호는 Publications 원본의 값을 따릅니다.
