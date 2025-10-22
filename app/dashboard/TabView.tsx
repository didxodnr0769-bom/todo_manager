"use client"

import { ListTodo, Calendar } from "lucide-react"

interface TabViewProps {
  activeTab: "todos" | "calendar"
  onTabChange: (tab: "todos" | "calendar") => void
}

export default function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="bg-gray-200 rounded-2xl p-1 flex">
      {/* 오늘의 할 일 탭 */}
      <button
        onClick={() => onTabChange("todos")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          activeTab === "todos"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        <ListTodo className="w-4 h-4" />
        오늘의 할 일
      </button>

      {/* 캘린더 일정 탭 */}
      <button
        onClick={() => onTabChange("calendar")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          activeTab === "calendar"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        <Calendar className="w-4 h-4" />
        캘린더 일정
      </button>
    </div>
  )
}
