"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: string
  end: string
  location?: string
  calendarId?: string
  calendarName?: string
  backgroundColor?: string
  foregroundColor?: string
}

interface CalendarEventsSectionProps {
  selectedDate: string
}

export default function CalendarEventsSection({
  selectedDate,
}: CalendarEventsSectionProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
    new Set()
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 이벤트 조회
  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/calendar/events?date=${selectedDate}`)
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      setEvents(data.events)
      setError(null)
    } catch (err) {
      setError("이벤트를 불러오는데 실패했습니다.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [selectedDate])

  // 체크박스 토글
  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  // 선택된 일정으로 To-Do 생성
  const createTodosFromSelectedEvents = async () => {
    if (selectedEventIds.size === 0) return

    try {
      setIsCreating(true)
      setError(null)

      const selectedEvents = events.filter((event) =>
        selectedEventIds.has(event.id)
      )

      const createPromises = selectedEvents.map((event) =>
        fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: event.summary,
            date: selectedDate,
          }),
        })
      )

      await Promise.all(createPromises)
      window.location.reload()
    } catch (err) {
      setError("To-Do 생성에 실패했습니다.")
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* To-Do 생성 버튼 */}
      {selectedEventIds.size > 0 && (
        <div className="flex justify-end">
          <button
            onClick={createTodosFromSelectedEvents}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:bg-gray-400"
          >
            <Plus className="w-4 h-4" />
            {isCreating
              ? "생성 중..."
              : `To-Do 생성하기 (${selectedEventIds.size})`}
          </button>
        </div>
      )}

      {/* 캘린더 이벤트 목록 */}
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500 text-sm">
          해당 날짜에 일정이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                index !== events.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 체크박스 */}
                <button
                  onClick={() => toggleEventSelection(event.id)}
                  className={`mt-1 w-4 h-4 rounded border flex-shrink-0 ${
                    selectedEventIds.has(event.id)
                      ? "bg-blue-500 border-blue-500"
                      : "bg-gray-100 border-gray-400"
                  }`}
                >
                  {selectedEventIds.has(event.id) && (
                    <svg
                      className="w-full h-full text-white"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* 캘린더 색상 인디케이터 */}
                {event.backgroundColor && (
                  <div
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.backgroundColor }}
                    title={event.calendarName}
                  />
                )}

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-gray-900">
                      {event.summary}
                    </span>
                    {event.calendarName && (
                      <span className="text-xs text-gray-500">
                        [{event.calendarName}]
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(event.start).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(event.end).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {event.location && (
                    <div className="text-sm text-gray-500 mt-1">
                      📍 {event.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
