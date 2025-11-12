"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
    new Set()
  );
  const queryClient = useQueryClient();

  // 캘린더 이벤트 조회 (TanStack Query)
  const {
    data: eventsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["calendar-events", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/calendar/events?date=${selectedDate}`);
      const data = await response.json();

      if (!response.ok) {
        // 401 에러이거나 토큰 관련 에러인 경우
        if (response.status === 401 || data.code === "TOKEN_EXPIRED" || data.code === "INVALID_CREDENTIALS") {
          throw new Error(data.message || "인증이 필요합니다. 다시 로그인해주세요.");
        }
        throw new Error(data.details || "Failed to fetch events");
      }

      return { events: data.events as CalendarEvent[], isAuthError: false };
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: (failureCount, error) => {
      // 인증 에러는 재시도하지 않음
      if (error.message.includes("로그인")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const events = eventsData?.events || [];
  const isAuthError = error?.message.includes("로그인") || error?.message.includes("인증");

  // To-Do 생성 Mutation
  const createTodosMutation = useMutation({
    mutationFn: async (selectedEvents: CalendarEvent[]) => {
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
    },
    onSuccess: () => {
      // To-Do 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["todos", selectedDate] });
      toast.success(`${selectedEventIds.size}개의 할 일이 생성되었습니다!`);
      setSelectedEventIds(new Set()); // 선택 초기화
    },
    onError: (err) => {
      toast.error("To-Do 생성에 실패했습니다.");
      console.error(err);
    },
  });

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
  const createTodosFromSelectedEvents = () => {
    if (selectedEventIds.size === 0) return;

    const selectedEvents = events.filter((event) =>
      selectedEventIds.has(event.id)
    );

    createTodosMutation.mutate(selectedEvents);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-300"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 glass-effect-strong border border-red-400/30 rounded-2xl glass-shadow">
        <div className="space-y-3">
          <div className="text-red-700 font-medium">
            {isAuthError ? "🔒 인증 만료" : "⚠️ 오류 발생"}
          </div>
          <p className="text-sm text-red-600">
            {error.message || "이벤트를 불러오는데 실패했습니다."}
          </p>
          {isAuthError && (
            <button
              onClick={() => window.location.href = "/api/auth/signin"}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium"
            >
              다시 로그인하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* To-Do 생성 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={createTodosFromSelectedEvents}
          disabled={createTodosMutation.isPending || selectedEventIds.size === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 text-sm font-medium glass-shadow ${
            selectedEventIds.size === 0 && !createTodosMutation.isPending
              ? "bg-white/20 text-gray-400 cursor-not-allowed"
              : createTodosMutation.isPending
              ? "bg-white/30 text-gray-500 cursor-not-allowed"
              : "glass-effect-strong text-gray-700 hover:glass-effect-light"
          }`}
        >
          <Plus className="w-4 h-4" />
          {createTodosMutation.isPending
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
