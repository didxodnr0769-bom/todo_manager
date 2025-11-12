"use client"

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const changeDate = (days: number) => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() + days)
    onDateChange(currentDate.toISOString().split("T")[0])
  }

  const goToToday = () => {
    onDateChange(new Date().toISOString().split("T")[0])
  }

  const isToday = () => {
    const today = new Date().toISOString().split("T")[0]
    return selectedDate === today
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    const weekday = weekdays[date.getDay()]
    return `${month}월 ${day}일 ${weekday}`
  }

  return (
    <div className="flex flex-col items-center py-4 gap-3">
      {/* 날짜 영역 - 정중앙 */}
      <div className="flex items-center gap-1">
        {/* 이전 버튼 */}
        <button
          onClick={() => changeDate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl glass-effect hover:glass-effect-strong transition-all duration-300"
          aria-label="이전 날짜"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* 날짜 표시 및 선택 */}
        <button
          className={`relative flex items-center gap-2 px-5 h-10 rounded-2xl glass-shadow transition-all duration-300 ${
            isToday()
              ? "glass-effect-light border-2 border-blue-400/60"
              : "glass-effect-strong hover:glass-effect-light"
          }`}
        >
          <Calendar className={`w-5 h-5 ${isToday() ? "text-blue-600" : "text-gray-700"}`} />
          <span className={`text-base font-semibold ${isToday() ? "text-blue-700" : "text-gray-700"}`}>
            {formatDate(selectedDate)}
          </span>
          {isToday() && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
              오늘
            </span>
          )}
        </button>

        {/* 다음 버튼 */}
        <button
          onClick={() => changeDate(1)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl glass-effect hover:glass-effect-strong transition-all duration-300"
          aria-label="다음 날짜"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* 오늘 버튼 - 오늘 날짜가 아닐 때만 표시 */}
      {!isToday() && (
        <button
          onClick={goToToday}
          className="px-3 h-8 glass-effect border border-blue-400/40 text-blue-600 text-sm font-medium rounded-xl hover:glass-effect-strong hover:border-blue-500/60 transition-all duration-300"
        >
          오늘로 이동
        </button>
      )}
    </div>
  )
}
