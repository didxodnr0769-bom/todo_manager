"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  calendarId?: string;
  calendarName?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  isAllDay?: boolean;
}

interface CalendarEventsSectionProps {
  selectedDate: string;
}

export default function CalendarEventsSection({
  selectedDate,
}: CalendarEventsSectionProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이벤트 조회
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/calendar/events?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events);
      setError(null);
    } catch (err) {
      setError("이벤트를 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // 체크박스 토글
  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // 선택된 일정으로 To-Do 생성
  const createTodosFromSelectedEvents = async () => {
    if (selectedEventIds.size === 0) return;

    try {
      setIsCreating(true);
      setError(null);

      const selectedEvents = events.filter((event) =>
        selectedEventIds.has(event.id)
      );

      const createPromises = selectedEvents.map((event) =>
        fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: event.summary,
            date: selectedDate,
          }),
        })
      );

      await Promise.all(createPromises);
      window.location.reload();
    } catch (err) {
      setError("To-Do 생성에 실패했습니다.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-300"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 glass-effect-strong border border-red-400/30 rounded-2xl text-red-700 text-sm glass-shadow">
          {error}
        </div>
      )}

      {/* To-Do 생성 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={createTodosFromSelectedEvents}
          disabled={isCreating || selectedEventIds.size === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 text-sm font-medium glass-shadow ${
            selectedEventIds.size === 0 && !isCreating
              ? "bg-white/20 text-gray-400 cursor-not-allowed"
              : isCreating
              ? "bg-white/30 text-gray-500 cursor-not-allowed"
              : "glass-effect-strong text-gray-700 hover:glass-effect-light"
          }`}
        >
          <Plus className="w-4 h-4" />
          {isCreating
            ? "생성 중..."
            : selectedEventIds.size > 0
            ? `To-Do 생성하기 (${selectedEventIds.size})`
            : "To-Do 생성하기"}
        </button>
      </div>

      {/* 캘린더 이벤트 목록 */}
      {events.length === 0 ? (
        <div className="glass-effect-strong rounded-3xl glass-shadow p-16 text-center">
          <div className="flex flex-col items-center gap-6">
            {/* 파티 이모지 아이콘 */}
            <div className="text-6xl">🎉</div>

            {/* 메시지 */}
            <div className="space-y-2">
              <p className="text-gray-700 font-medium text-base leading-relaxed">
                오늘 예정된 일정이 없습니다.
                <br />
                편안한 하루 보내세요!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-effect-strong rounded-3xl glass-shadow overflow-hidden">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`px-6 py-4 hover:bg-white/20 transition-all duration-200 ${
                index !== events.length - 1 ? "border-b border-gray-200/30" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 체크박스 */}
                <button
                  onClick={() => toggleEventSelection(event.id)}
                  className={`mt-1 w-4 h-4 rounded border flex-shrink-0 transition-all duration-200 ${
                    selectedEventIds.has(event.id)
                      ? "bg-pink-300 border-pink-300"
                      : "bg-white/40 border-gray-400 hover:bg-white/60"
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
                    <span className="text-base font-medium text-gray-700">
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
                    {event.isAllDay ? (
                      "하루종일"
                    ) : (
                      <>
                        {new Date(event.start).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(event.end).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    )}
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
  );
}
