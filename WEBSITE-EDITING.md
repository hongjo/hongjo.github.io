# 연구실 홈페이지 수정 안내

공개 주소: https://hongjo.github.io/

## 콘텐츠 수정

- 국문·영문 데이터: `data/ko/`, `data/en/`
- 대학원 모집 안내: 각 언어의 `admissions.json`
- 학기별 수업: 각 언어의 `teaching.json` (`semesters` 맨 앞이 최신 학기)
- 구성원: 각 언어의 `members.json` — 두 언어의 명단을 함께 수정
- 논문 목록: `data/ko/publications.json` (양쪽 언어에서 같은 목록 사용)
- 대표 연구 요약: `data/research.json`
- 블로그 목록: 각 언어의 `blog.json`, 본문: `blog/ko/`, `blog/en/`의 Markdown
- 사진 원본: `img/` — 빌드 시 반응형 WebP를 자동 생성하며 원본은 확대용으로 유지
- 디자인과 동작: `assets/style.css`, `assets/site.js`
- 페이지 생성: `scripts/build.mjs`, 홈 기본 틀: `templates/home.html`

미공개 논문 파일은 별도로 추가하지 않았습니다. 모집 안내의 2년 지원 프로그램은 2026년 9월 기준으로 명시했습니다. 변동 시 해당 안내를 갱신해 주세요.

## 로컬 확인 및 배포

Node.js 22 이상에서:

```sh
npm ci
npm run build
npm run check
```

`_site/`가 배포용 결과물입니다. `master` 브랜치에 변경을 반영하면 GitHub Actions가 빌드·검증 후 GitHub Pages에 배포합니다. Actions의 `Build and publish lab website`에서 결과를 확인할 수 있습니다. Pages의 게시 소스는 GitHub Actions를 사용합니다.

루트의 기존 HTML은 이전 배포 기록이며, 앞으로 수정할 원본은 위의 JSON/Markdown/스크립트입니다. 생성된 HTML을 수작업으로 수정하지 마세요.

### 구성원의 Research & background

행정 담당을 제외한 모든 구성원은 연구 및 상세 소개, Publications, Patents 항목을 갖습니다. 논문·특허는 `data/ko/publications.json`의 저자·발명자 이름을 기준으로 자동 연결되므로 실적을 각 구성원에게 중복 입력할 필요가 없습니다. 실적이 등록되지 않은 경우에는 홈페이지에 등록된 항목이 없다는 안내가 표시됩니다.

국·영문 이름과 확인된 영문 철자 변형은 `data/member-author-aliases.json`에서 관리합니다. 이니셜이나 유사한 이름만으로 연결하지 말고, 동일 인물임을 확인한 이름만 추가하세요. `data/en/members.json`과 `data/ko/members.json`의 `details`는 경력·연구 소개이며, 연구실 전체 목록에 없는 개인 논문·학회 발표는 `additionalPublications` 배열에 기록할 수 있습니다. 특허의 출원·등록 구분과 번호는 Publications 원본의 값을 따릅니다.
