import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">G-Cal To-Do Automator</h1>
        <p className="text-gray-600 mb-8">구글 캘린더 일정을 자동으로 To-Do 리스트로 변환합니다</p>
        <a
          href="/auth/signin"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          시작하기
        </a>
      </div>
    </div>
  )
}
