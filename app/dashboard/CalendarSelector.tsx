"use client"

import { useEffect, useState } from "react"

interface Calendar {
  id: string
  summary: string
  description?: string
  primary?: boolean
  accessRole: string
  backgroundColor?: string
  foregroundColor?: string
  selected?: boolean
}

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: string
  end: string
  location?: string
}

export default function CalendarSelector() {
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("primary")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  // 캘린더 목록 조회
  const fetchCalendars = async () => {
    try {
      setIsLoadingCalendars(true)
      const response = await fetch("/api/calendar/list")
      if (!response.ok) throw new Error("Failed to fetch calendars")
      const data = await response.json()
      setCalendars(data.calendars)
      setError(null)
    } catch (err) {
      setError("캘린더 목록을 불러오는데 실패했습니다.")
      console.error(err)
    } finally {
      setIsLoadingCalendars(false)
    }
  }

  // 선택된 캘린더의 이벤트 조회
  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true)
      const response = await fetch(
        `/api/calendar/events?calendarId=${selectedCalendarId}&date=${selectedDate}`
      )
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
    fetchCalendars()
  }, [])

  useEffect(() => {
    if (selectedCalendarId) {
      fetchEvents()
    }
  }, [selectedCalendarId, selectedDate])

  // 날짜 변경 핸들러
  const changeDate = (days: number) => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() + days)
    setSelectedDate(currentDate.toISOString().split("T")[0])
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 캘린더 목록 */}
      <div>
        <h3 className="font-semibold mb-3">캘린더 선택</h3>
        {isLoadingCalendars ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>로딩 중...</span>
          </div>
        ) : calendars.length === 0 ? (
          <p className="text-gray-500">캘린더 목록이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {calendars.map((calendar) => (
              <label
                key={calendar.id}
                className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                  selectedCalendarId === calendar.id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="calendar"
                  value={calendar.id}
                  checked={selectedCalendarId === calendar.id}
                  onChange={(e) => setSelectedCalendarId(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{calendar.summary}</span>
                    {calendar.primary && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        기본
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      ({calendar.accessRole})
                    </span>
                  </div>
                  {calendar.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {calendar.description}
                    </p>
                  )}
                </div>
                {calendar.backgroundColor && (
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: calendar.backgroundColor }}
                  ></div>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

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
            onClick={() =>
              setSelectedDate(new Date().toISOString().split("T")[0])
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            오늘
          </button>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div>
        <h3 className="font-semibold mb-3">
          캘린더 이벤트 ({selectedDate})
        </h3>
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
                className="p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="font-medium">{event.summary}</div>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
