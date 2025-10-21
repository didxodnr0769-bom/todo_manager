import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">안녕하세요, {session.user?.name}님</h1>
            <p className="text-gray-600 mt-2">오늘의 할 일</p>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              로그아웃
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">To-Do 리스트</h2>
          <p className="text-gray-500">UI는 추후 추가 예정입니다.</p>
          <p className="text-sm text-gray-400 mt-2">
            API 엔드포인트: GET /api/todos, POST /api/todos, PATCH /api/todos/[id], DELETE /api/todos/[id]
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">크론 작업 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 매일 00:00 - 구글 캘린더에서 오늘 일정 가져오기 (GET /api/cron/create-todos)</li>
            <li>• 매일 21:00 - 미완료 항목 알림 발송 (GET /api/cron/send-notifications)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
