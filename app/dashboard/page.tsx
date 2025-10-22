"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Header from "./Header"
import DatePicker from "./DatePicker"
import TabView from "./TabView"
import TodoListSection from "./TodoListSection"
import CalendarEventsSection from "./CalendarEventsSection"
import YesterdayTodos from "./YesterdayTodos"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [activeTab, setActiveTab] = useState<"todos" | "calendar">("todos")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <Header userName={session?.user?.name} userEmail={session?.user?.email} />

      {/* 메인 컨텐츠 */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 날짜 선택기 */}
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* 탭 뷰 */}
        <TabView activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 탭 컨텐츠 */}
        {activeTab === "todos" ? (
          <TodoListSection selectedDate={selectedDate} />
        ) : (
          <CalendarEventsSection selectedDate={selectedDate} />
        )}

        {/* 어제 완료하지 못한 할 일 */}
        <YesterdayTodos />
      </div>
    </div>
  )
}
