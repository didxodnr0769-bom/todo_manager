# G-Cal To-Do Automator (MVP v1.0) 개발 요청서

## 1. 🎯 프로젝트 개요

- **프로젝트명:** G-Cal To-Do Automator
- **목표:** 사용자가 구글 캘린더 일정을 수동으로 To-Do 리스트 앱에 옮겨 적는 불편함을 해결합니다. 당일 구글 캘린더 일정을 자동으로 가져와 To-Do 리스트를 만들고, 저녁에는 완료되지 않은 항목에 대해 푸시 알림을 보내는 웹 앱을 개발합니다.

## 2. 🛠️ 핵심 기술 스택

- **프레임워크:** Next.js (App Router)
- **데이터베이스:** PostgreSQL (Supabase 호스팅)
- **ORM:** Prisma
- **인증:** NextAuth.js (Google OAuth 2.0)
- **배포 및 스케줄링:** Vercel (Vercel Cron Jobs)
- **스타일링:** Tailwind CSS

## 3. ✨ 필수 기능 및 구현 상세 (MVP)

### A. Google 계정 인증 (F-01)

- NextAuth.js를 사용하여 "Google 계정으로 시작하기" 기능을 구현합니다.
- Google Calendar 접근을 위해 `calendar.readonly` 스코프 권한을 요청해야 합니다.
- 사용자 정보(이름, 이메일, 토큰)는 DB에 저장합니다.

### B. 데이터베이스 스키마 (Prisma)

- `schema.prisma` 파일에 아래 모델들을 정의합니다.
  - `User`: 구글 인증 정보 및 API 토큰 저장
  - `Todo`: 할 일 내용(`content`), 완료 여부(`isCompleted`), 날짜(`date`), 사용자(`User`)와의 관계 포함
  - `Account`, `Session`: NextAuth.js 표준 모델

### C. To-Do 리스트 자동 생성 (F-02)

- **API 라우트:** `/api/cron/create-todos`
- **실행:** 매일 00:00시에 Vercel Cron Job으로 실행됩니다.
- **로직:** 모든 사용자의 당일 구글 캘린더 일정을 가져와 DB의 `Todo` 테이블에 자동으로 생성합니다.

### D. To-Do 리스트 관리 (F-03, F-04, F-06)

해당 기능은 실제 캘린더의 일정을 조작하지 않으며, todo_manager 서비스의 DB 데이터를 조작합니다.

- **프론트엔드:** 로그인한 사용자의 오늘 To-Do 리스트를 보여주는 UI를 구현합니다.
- **핵심 UI 기능:**
  - 체크박스를 클릭하여 To-Do 완료 상태(`isCompleted`)를 변경합니다.
  - 새로운 To-Do를 수동으로 추가하는 입력 폼을 제공합니다.
  - 각 To-Do를 삭제하는 버튼을 제공합니다.
- **API 라우트:**
  - `GET /api/todos`: 오늘 To-Do 목록 조회
  - `PATCH /api/todos/[id]`: 완료 상태 변경
  - `POST /api/todos`: 새 To-Do 추가
  - `DELETE /api/todos/[id]`: To-Do 삭제

### E. 미완료 항목 알림 (F-05)

- **API 라우트:** `/api/cron/send-notifications`
- **실행:** 매일 21:00시에 Vercel Cron Job으로 실행됩니다.
- **로직:** 당일 완료되지 않은 To-Do가 있는 사용자에게 웹 푸시 알림을 발송합니다. (푸시 알림 로직은 주석으로 처리해도 무방합니다.)

---
