# G-Cal To-Do Automator

구글 캘린더 일정을 자동으로 To-Do 리스트로 변환하는 웹 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **데이터베이스**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **인증**: NextAuth.js v5 (Google OAuth 2.0)
- **배포**: Vercel
- **스타일링**: Tailwind CSS

## 주요 기능

### ✅ 구현된 기능

1. **Google OAuth 인증** (F-01)
   - Google 계정으로 로그인
   - Google Calendar API 권한 획득 (`calendar.readonly`)

2. **데이터베이스 스키마** (B)
   - User, Account, Session, Todo 모델 정의
   - Prisma를 통한 타입 안전성 보장

3. **To-Do 관리 API** (D)
   - `GET /api/todos` - 오늘 할 일 목록 조회
   - `POST /api/todos` - 새 할 일 추가
   - `PATCH /api/todos/[id]` - 완료 상태 변경
   - `DELETE /api/todos/[id]` - 할 일 삭제

4. **자동 일정 동기화** (C)
   - `GET /api/cron/create-todos` - 매일 00:00 자동 실행
   - Google Calendar에서 당일 일정을 가져와 To-Do 생성

5. **미완료 항목 알림** (E)
   - `GET /api/cron/send-notifications` - 매일 21:00 자동 실행
   - 미완료 항목이 있는 사용자에게 알림 (현재 로그만 출력, 푸시 알림은 추후 구현)

### 🚧 추후 구현 예정

- 대시보드 UI (현재 기본 페이지만 구현됨)
- 웹 푸시 알림 기능
- To-Do 리스트 인터랙티브 UI

## 설치 및 설정

### 1. 저장소 클론

```bash
git clone https://github.com/didxodnr0769-bom/todo_manager.git
cd todo_manager
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

`.env` 파일에 다음 값들을 설정:

```env
# Supabase PostgreSQL 연결 URL
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="랜덤한-시크릿-키-생성"

# Google OAuth 인증 정보
GOOGLE_CLIENT_ID="구글-클라이언트-ID"
GOOGLE_CLIENT_SECRET="구글-클라이언트-시크릿"
```

### 4. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" → "Credentials" 이동
4. "Create Credentials" → "OAuth client ID" 선택
5. Application type: "Web application" 선택
6. Authorized redirect URIs 추가:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://your-domain.com/api/auth/callback/google`
7. Client ID와 Client Secret을 `.env` 파일에 추가
8. "APIs & Services" → "Library"에서 "Google Calendar API" 활성화

### 5. 데이터베이스 설정

Prisma를 사용하여 데이터베이스 마이그레이션:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 배포

### Vercel 배포

1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정 (`.env` 파일의 모든 변수)
3. `NEXTAUTH_URL`을 프로덕션 도메인으로 변경
4. 배포 완료 후 Google OAuth Redirect URI에 프로덕션 URL 추가

### Cron Job

`vercel.json` 파일에 이미 설정되어 있습니다:
- 매일 00:00 - To-Do 자동 생성
- 매일 21:00 - 미완료 알림 발송

## 프로젝트 구조

```
09_todo_manager/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth 인증 라우트
│   │   ├── todos/                  # To-Do CRUD API
│   │   └── cron/                   # Cron Job API
│   ├── auth/signin/                # 로그인 페이지
│   ├── dashboard/                  # 대시보드 (추후 UI 추가)
│   └── page.tsx                    # 메인 페이지
├── lib/
│   ├── auth.ts                     # NextAuth 설정
│   └── prisma.ts                   # Prisma 클라이언트
├── prisma/
│   └── schema.prisma               # 데이터베이스 스키마
└── vercel.json                     # Vercel Cron 설정
```

## API 엔드포인트

### 인증

- `GET/POST /api/auth/[...nextauth]` - NextAuth 인증 처리

### To-Do 관리

- `GET /api/todos` - 오늘 할 일 목록 조회
- `POST /api/todos` - 새 할 일 추가
  - Body: `{ content: string }`
- `PATCH /api/todos/[id]` - 완료 상태 변경
  - Body: `{ isCompleted: boolean }`
- `DELETE /api/todos/[id]` - 할 일 삭제

### Cron Jobs

- `GET /api/cron/create-todos` - 캘린더 일정 동기화 (매일 00:00)
- `GET /api/cron/send-notifications` - 미완료 알림 발송 (매일 21:00)

## 라이선스

MIT

## 기여

이슈와 PR을 환영합니다!
