"use client"

import { ListTodo, Calendar } from "lucide-react"

interface TabViewProps {
  activeTab: "todos" | "calendar"
  onTabChange: (tab: "todos" | "calendar") => void
}

export default function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="glass-effect rounded-3xl p-1 flex glass-shadow">
      {/* 오늘의 할 일 탭 */}
      <button
        onClick={() => onTabChange("todos")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
          activeTab === "todos"
            ? "glass-effect-strong text-gray-700 shadow-lg"
            : "text-gray-600 hover:text-gray-700 hover:bg-white/10"
        }`}
      >
        <ListTodo className="w-4 h-4" />
        오늘의 할 일
      </button>

      {/* 캘린더 일정 탭 */}
      <button
        onClick={() => onTabChange("calendar")}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
          activeTab === "calendar"
            ? "glass-effect-strong text-gray-700 shadow-lg"
            : "text-gray-600 hover:text-gray-700 hover:bg-white/10"
        }`}
      >
        <Calendar className="w-4 h-4" />
        캘린더 일정
      </button>
    </div>
  )
}
