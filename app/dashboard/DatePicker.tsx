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
        <button className="flex items-center gap-2 px-5 h-10 rounded-2xl glass-effect-strong glass-shadow transition-all duration-300 hover:glass-effect-light">
          <Calendar className="w-5 h-5 text-gray-700" />
          <span className="text-base font-semibold text-gray-700">
            {formatDate(selectedDate)}
          </span>
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

      {/* 오늘 버튼 - 다음 라인 */}
      <button
        onClick={goToToday}
        className="px-3 h-8 glass-effect border border-gray-400/40 text-gray-700 text-sm font-medium rounded-xl hover:glass-effect-strong transition-all duration-300"
      >
        오늘
      </button>
    </div>
  )
}
