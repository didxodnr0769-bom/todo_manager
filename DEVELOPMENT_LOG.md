# G-Cal To-Do Automator 개발 로그

## 작업 이력

### 2025-10-21

#### 초기 설정
- 개발 로그 파일 생성 (DEVELOPMENT_LOG.md)
- 프로젝트 구조 확인
  - Next.js App Router 구조 확인
  - 환경 변수 설정 파일 확인 (.env.example)
  - 기존 파일 상태:
    - `README.md`: 수정됨
    - `app/page.tsx`: 수정됨
    - `package.json`, `package-lock.json`: 수정됨
    - 신규 디렉토리: `app/api/`, `app/auth/`, `app/dashboard/`, `lib/`, `prisma/`
    - `vercel.json`: 신규 생성

#### Google 캘린더 연동 및 디버깅 기능 추가
**커밋:** `feat: Google 캘린더 연동 및 디버깅 기능 추가` (70e71e2)

**주요 변경사항:**
1. **NextAuth 세션 관리 방식 변경**
   - DB 어댑터 기반 → JWT 기반 세션으로 전환
   - 이유: DB 연결 없이도 Google OAuth 및 캘린더 API 사용 가능
   - `lib/auth.ts`:
     - `jwt` 콜백에서 액세스 토큰을 JWT에 저장
     - `session` 콜백에서 세션에 액세스 토큰 추가
     - PrismaAdapter 임시 비활성화 (DB 연결 전까지)

2. **새로운 API 엔드포인트 추가**
   - `/api/calendar/events` (route.ts:18-60): Google Calendar API를 통해 오늘의 일정 조회
   - `/api/debug/session` (route.ts:6-10): 현재 세션 정보 디버깅용
   - `/api/auth/refresh` (route.ts:6-33): 액세스 토큰 갱신 (만료 시 사용)

3. **타입 정의 확장**
   - `types/next-auth.d.ts`: NextAuth Session 및 JWT 타입에 `accessToken` 필드 추가

4. **대시보드 UI 개선**
   - `app/dashboard/page.tsx`:
     - 세션 확인 버튼 추가
     - 캘린더 이벤트 조회 버튼 추가
     - 재인증(로그아웃 후 재로그인) 버튼 추가
     - 첫 로그인 시 액세스 토큰 이슈 안내 메시지 추가

5. **Prisma 스키마 개선**
   - `prisma/schema.prisma`: Supabase Pooler 사용을 위한 `directUrl` 설정 추가

**기술적 결정:**
- DB 연결 없이도 Google Calendar API 테스트 가능하도록 JWT 세션 우선 구현
- 추후 DB 연결 시 PrismaAdapter 주석 해제 및 토큰 저장 로직 추가 예정

**테스트 방법:**
1. Google OAuth 로그인
2. 대시보드에서 "세션 확인" 클릭하여 `accessToken` 존재 확인
3. "캘린더 이벤트 조회" 클릭하여 오늘의 일정 확인
4. 액세스 토큰이 없으면 "재인증" 버튼으로 재로그인

---

## 다음 작업 예정
- [ ] Supabase PostgreSQL 데이터베이스 연결
- [ ] PrismaAdapter 활성화 및 마이그레이션 실행
- [ ] To-Do 리스트 CRUD API 활성화 (현재 비활성화 상태)
- [ ] 캘린더 일정 → To-Do 자동 생성 Cron Job 테스트
- [ ] 대시보드 To-Do UI 구현
