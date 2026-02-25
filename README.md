# 감정 다이어리

감정을 기반으로 일상을 기록하고 관리할 수 있는 웹 기반 다이어리 서비스입니다.
Vanilla JavaScript를 활용해 LocalStorage 기반 CRUD 기능을 직접 구현한 프로젝트입니다.
검색, 필터링, 페이지네이션, 비동기 데이터 처리 등 프론트엔드의 기초 개념을 학습하며 구현했습니다.

## 🔗 Links

- Deploy: https://mood-palette-diary.vercel.app
- GitHub: https://github.com/sub1n17/mood-palette

## 🛠 Tech Stack

- HTML
- CSS
- JavaScript
- LocalStorage
- Fetch API
- Clipboard API

## 📄 Pages

- **일기 보관함**  
  일기 목록 조회, 검색 및 감정 필터링
- **상세 페이지**
  일기 내용 조회, 회고 작성, 수정·삭제
- **사진 보관함**  
  외부 API를 활용한 랜덤 이미지 조회

## 📌 주요 구현 기능

- LocalStorage 기반 일기 등록·수정·삭제 CRUD 구현
- radio input으로 5가지 감정 선택 및 감정별 필터링 기능
- 디바운싱을 적용한 검색 기능 구현
- 페이지네이션으로 일기 목록 관리
- Fetch API를 활용한 외부 이미지 데이터 연동
- 데이터 로딩 중 스켈레톤 UI 처리
- 다크모드 테마 전환 기능
- Clipboard API를 활용한 텍스트 복사 기능
- 반응형 레이아웃 구현

## 🔥 Trouble Shooting

**검색 성능 최적화**

- 검색어를 입력할 때마다 검색 함수가 실행되어 성능 저하 문제 발생
- 디바운싱을 적용해 검색 실행 시점 제어 및 성능 개선
