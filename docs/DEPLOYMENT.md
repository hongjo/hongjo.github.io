# 개인 포크 배포 기록

- 공개 미리보기: https://sh-joo.github.io/hongjo.github.io/
- 저장소: https://github.com/SH-Joo/hongjo.github.io
- 배포 브랜치: `redesign/story`
- 게시된 소스 커밋: `3e79f0f6fa41a6e350fbb1ddafbb4219785efc8f`
- 배포 실행: https://github.com/SH-Joo/hongjo.github.io/actions/runs/38908919362
- 확인일: 2026-10-16 (한국 시간 2026-10-16 22시대)

교수님 저장소에 보낼 PR의 검토용 미리보기다. GitHub Pages의 GitHub Actions 방식으로 `_site/`를 게시하며, 경로 접두사는 `/hongjo.github.io`다. 개인 홈페이지 `https://sh-joo.github.io/`는 별도 저장소 `SH-Joo/SH-joo.github.io`에서 계속 운영된다. 이번 작업은 해당 개인 홈페이지의 코드·Pages 설정·배포를 변경하지 않았다. 확인 시 개인 홈페이지는 정상 응답했고 저장소의 마지막 푸시 시각은 `2026-09-18T06:01:40Z`였다.

## 배포 확인

- GitHub Actions의 빌드·콘텐츠 검사·브라우저 검사 119건·Pages 게시가 모두 성공했다.
- 공개 `build-info.json`의 커밋과 경로가 위 배포 소스와 일치한다. 한영 52개 페이지를 생성했다.
- 최신 교량 이미지 원본의 SHA-256이 로컬 제공 이미지와 일치한다.
- 공개 사이트에서 영어 기본 화면, Home 링크, 다섯 섹션 내비게이션, 한영 전환, 36명 구성원, Siheon Joo 사진·수상 소개, 유지민 학생 소개를 확인했다.
- 논문 128건과 저자 그룹·복합 필터·새로고침 복원, 활동별 앨범·원본 사진 확대·포커스 복귀, 모바일 메뉴·가로 넘침을 확인했다.
- 공개 브라우저 검사에서 HTTP 오류·JavaScript 오류 0건. 운영체제 화면 제어 없이 headless Chrome으로 검사했다.

## 다시 게시하기

1. `redesign/story`에 변경을 커밋하고 개인 포크로 푸시한다.
2. [Build and publish lab website](https://github.com/SH-Joo/hongjo.github.io/actions/workflows/site.yml)에서 **Run workflow**를 누르고 `redesign/story`를 선택해 실행한다.
3. `build`와 `deploy` 성공을 확인하고 공개 주소에서 변경 사항을 확인한다.

브랜치 푸시는 자동 검증과 결과물 보관까지 실행한다. `redesign/story`의 실제 게시는 위 수동 실행에서 진행한다. `github-pages` 환경의 배포 허용 목록에 이 브랜치를 등록했다. 기존 `master`·`add-jimin-yu` 브랜치를 유지했고 교수님 저장소에 푸시하거나 PR을 제출하지 않았다.

포크 미리보기에는 검색엔진 중복 수집을 막는 `noindex` 설정을 유지한다. 교수님 저장소에 적용할 때는 빌드가 저장소 소유자로 도메인·기본 경로·검색엔진 설정을 자동 결정한다.
