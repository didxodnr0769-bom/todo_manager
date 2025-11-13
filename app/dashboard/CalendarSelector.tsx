"use client"

import { useEffect, useState } from "react"
import { getTodayKST, addDaysToDateString } from "@/lib/dateUtils"

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

export default function CalendarSelector() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set())
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isCreatingTodos, setIsCreatingTodos] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKST())

  // 모든 캘린더의 이벤트 조회
  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true)
      const response = await fetch(`/api/calendar/events?date=${selectedDate}`)
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      setEvents(data.events)
      setError(null)
    } catch (err) {
      setError("이벤트를 불러오는데 실패했습니다.")
      console.error(err)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (selectedEventIds.size === 0) {
      setError("선택된 일정이 없습니다.")
      return
    }

    try {
      setIsCreatingTodos(true)
      setError(null)
      setSuccessMessage(null)

      const selectedEvents = events.filter((event) =>
        selectedEventIds.has(event.id)
      )

      // 각 이벤트를 To-Do로 생성
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

      setSuccessMessage(
        `${selectedEventIds.size}개의 To-Do가 생성되었습니다.`
      )
      setSelectedEventIds(new Set())

      // To-Do 리스트 새로고침을 위해 페이지 리로드 또는 이벤트 발생
      window.location.reload()
    } catch (err) {
      setError("To-Do 생성에 실패했습니다.")
      console.error(err)
    } finally {
      setIsCreatingTodos(false)
    }
  }

  // 날짜 변경 핸들러
  const changeDate = (days: number) => {
    setSelectedDate(addDaysToDateString(selectedDate, days))
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* 날짜 선택 */}
      <div>
        <h3 className="font-semibold mb-3">날짜 선택</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            title="이전 날짜"
          >
            ←
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => changeDate(1)}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            title="다음 날짜"
          >
            →
          </button>
          <button
            onClick={() => setSelectedDate(getTodayKST())}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            오늘
          </button>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">
            캘린더 이벤트 ({selectedDate})
          </h3>
          {selectedEventIds.size > 0 && (
            <button
              onClick={createTodosFromSelectedEvents}
              disabled={isCreatingTodos}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreatingTodos
                ? "생성 중..."
                : `To-Do 생성하기 (${selectedEventIds.size})`}
            </button>
          )}
        </div>

        {isLoadingEvents ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>로딩 중...</span>
          </div>
        ) : events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            해당 날짜에 일정이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEventIds.has(event.id)}
                    onChange={() => toggleEventSelection(event.id)}
                    className="mt-1 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {event.backgroundColor && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.backgroundColor }}
                          title={event.calendarName}
                        ></div>
                      )}
                      <span className="font-medium">{event.summary}</span>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
