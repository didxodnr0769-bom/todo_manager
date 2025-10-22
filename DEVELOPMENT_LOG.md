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

### 2025-10-22

#### Figma 디자인 기반 대시보드 UI 전면 개편
**커밋:** `feat: Figma 디자인 기반 대시보드 UI 전면 개편` (2593a77)

**주요 변경사항:**

1. **모바일 중심 반응형 디자인 적용**
   - `max-w-md` 컨테이너를 사용한 모바일 퍼스트 접근
   - 배경색 `bg-gray-100`, 카드 기반 레이아웃
   - 일관된 간격 (space-y-6) 및 패딩 적용

2. **컴포넌트 기반 모듈화 아키텍처**
   - `app/dashboard/Header.tsx`: 로고, 프로필 아바타(이니셜), 로그아웃 기능
   - `app/dashboard/DatePicker.tsx`: 이전/다음/오늘 버튼, 날짜 포맷팅 (예: "10월 23일 목요일")
   - `app/dashboard/TabView.tsx`: 두 개 탭 전환 UI (오늘의 할 일 / 캘린더 일정)
   - `app/dashboard/TodoListSection.tsx`: To-Do CRUD 기능 통합, 완료/미완료 통계
   - `app/dashboard/CalendarEventsSection.tsx`: 구글 캘린더 이벤트 조회 및 To-Do 생성
   - `app/dashboard/YesterdayTodos.tsx`: 어제 미완료 항목 표시 및 오늘로 이동 기능
   - `app/dashboard/AddTodoDialog.tsx`: 시간 설정 가능한 일정 추가 모달

3. **세션 관리 개선**
   - `app/providers.tsx` 추가: SessionProvider로 앱 전체 감싸기
   - `app/dashboard/page.tsx`: 클라이언트 컴포넌트로 전환, `useSession` 훅 사용
   - `useRouter`를 통한 클라이언트 사이드 리다이렉트 처리

4. **UI/UX 개선사항**
   - **체크박스 디자인**: 커스텀 SVG 체크 아이콘, 완료 시 파란색 배경
   - **호버 효과**: 모든 인터랙티브 요소에 트랜지션 애니메이션 추가
   - **삭제 버튼**: 호버 시에만 표시 (opacity-0 → opacity-100)
   - **로딩 상태**: 스피너 애니메이션 및 중앙 정렬
   - **에러 처리**: 빨간색 알림 박스 (bg-red-50, border-red-200)
   - **시간 파싱**: content에서 "HH:MM - HH:MM" 형식 추출 및 별도 표시

5. **아이콘 시스템**
   - `lucide-react` 라이브러리 활용
   - 사용된 아이콘: ChevronLeft, ChevronRight, Calendar, ListTodo, Plus, CheckSquare, Trash2, Clock, ChevronUp, ChevronDown, ArrowRight

**기술적 결정:**
- **클라이언트 컴포넌트 전환**: 실시간 상태 관리 및 인터랙션을 위해 필수
- **컴포넌트 분리**: 재사용성 및 유지보수성 향상
- **Figma 디자인 충실도**: 색상, 간격, 크기를 Figma 디자인에 최대한 맞춤
- **점진적 기능 추가**: 기본 UI 먼저 구현, 추후 고급 기능 추가 가능

**파일 구조 변경:**
```
app/
├── dashboard/
│   ├── page.tsx (클라이언트 컴포넌트로 전환)
│   ├── Header.tsx (신규)
│   ├── DatePicker.tsx (신규)
│   ├── TabView.tsx (신규)
│   ├── TodoListSection.tsx (신규)
│   ├── CalendarEventsSection.tsx (신규)
│   ├── YesterdayTodos.tsx (신규)
│   ├── AddTodoDialog.tsx (신규)
│   ├── TodoList.tsx (기존, 일부 수정)
│   └── CalendarSelector.tsx (기존, 유지)
├── layout.tsx (SessionProvider 추가)
└── providers.tsx (신규)
```

**테스트 방법:**
1. 로그인 후 대시보드 접속 (http://localhost:3001/dashboard)
2. 헤더에서 프로필 아바타 확인 (이니셜 표시)
3. 날짜 선택기로 이전/다음 날짜 이동
4. "오늘의 할 일" 탭에서:
   - "일정 추가" 버튼으로 새 To-Do 추가
   - 체크박스 클릭하여 완료/미완료 전환
   - 호버 시 삭제 버튼 표시 확인
5. "캘린더 일정" 탭에서:
   - 구글 캘린더 이벤트 조회
   - 체크박스로 선택 후 "To-Do 생성하기" 클릭
6. "어제 완료하지 못한 할 일" 섹션:
   - 접기/펼치기 기능 확인
   - 전체 선택 및 오늘로 이동 기능 테스트

**성능 고려사항:**
- `useEffect` 훅으로 날짜 변경 시 자동 데이터 재조회
- 불필요한 리렌더링 방지를 위한 상태 관리
- 에러 바운더리 및 로딩 상태 처리

---

## 다음 작업 예정
- [x] Supabase PostgreSQL 데이터베이스 연결
- [x] PrismaAdapter 활성화 및 마이그레이션 실행
- [x] To-Do 리스트 CRUD API 활성화
- [x] 대시보드 To-Do UI 구현
- [x] Figma 디자인 기반 UI 개편
- [ ] 캘린더 일정 → To-Do 자동 생성 Cron Job 테스트
- [ ] 미완료 항목 알림 기능 구현
- [ ] 모바일 반응형 추가 테스트 및 최적화
- [ ] 접근성(a11y) 개선
- [ ] 다크 모드 지원
