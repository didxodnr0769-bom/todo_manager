"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"

interface AddTodoDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (todo: { content: string; startTime?: string; endTime?: string }) => void
  selectedDate: Date
}

const timeSlots = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30",
  "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
]

export default function AddTodoDialog({ isOpen, onClose, onAdd, selectedDate }: AddTodoDialogProps) {
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      content: title.trim(),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    })

    // Reset form
    setTitle("")
    setStartTime("")
    setEndTime("")
    onClose()
  }

  const handleCancel = () => {
    setTitle("")
    setStartTime("")
    setEndTime("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-center relative border-b p-6">
          <h2 className="text-lg font-medium">새 일정 추가</h2>
          <button
            onClick={handleCancel}
            className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              일정 제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 주간 회의"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">시간 (선택사항)</label>
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm text-gray-600">
                  시작 시간
                </label>
                <select
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">선택</option>
                  {timeSlots.map((time) => (
                    <option key={`start-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm text-gray-600">
                  종료 시간
                </label>
                <select
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">선택</option>
                  {timeSlots.map((time) => (
                    <option key={`end-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
