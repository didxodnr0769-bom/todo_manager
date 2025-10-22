"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react";

interface Todo {
  id: string;
  content: string;
  isCompleted: boolean;
  date: string;
  createdAt: string;
}

export default function YesterdayTodos() {
  const [yesterdayTodos, setYesterdayTodos] = useState<Todo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  // 어제 날짜 계산
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  // 어제의 미완료 할 일 조회
  const fetchYesterdayTodos = async () => {
    try {
      setIsLoading(true);
      const yesterdayDate = getYesterdayDate();
      const response = await fetch(`/api/todos?date=${yesterdayDate}`);
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      // 미완료 항목만 필터링
      const incompleteTodos = data.filter((todo: Todo) => !todo.isCompleted);
      setYesterdayTodos(incompleteTodos);
    } catch (err) {
      console.error("어제 할 일을 불러오는데 실패했습니다:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYesterdayTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedIds.size === yesterdayTodos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(yesterdayTodos.map((todo) => todo.id)));
    }
  };

  // 개별 선택
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // 오늘 할 일로 추가
  const moveToToday = async () => {
    if (selectedIds.size === 0) return;

    try {
      setIsMoving(true);
      const today = new Date().toISOString().split("T")[0];

      const selectedTodos = yesterdayTodos.filter((todo) =>
        selectedIds.has(todo.id)
      );

      // 각 할 일을 오늘 날짜로 복사
      const createPromises = selectedTodos.map((todo) =>
        fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: todo.content,
            date: today,
          }),
        })
      );

      await Promise.all(createPromises);

      // 성공 후 목록 새로고침
      window.location.reload();
    } catch (err) {
      console.error("오늘 할 일로 추가하는데 실패했습니다:", err);
    } finally {
      setIsMoving(false);
    }
  };

  // 시간 파싱
  const parseTimeFromContent = (content: string) => {
    const timeMatch = content.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
      return {
        text: content.replace(timeMatch[0], "").trim(),
        time: timeMatch[0],
      };
    }
    return { text: content, time: null };
  };

  if (isLoading || yesterdayTodos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div
        className="border-b border-gray-200 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              <h3 className="text-base font-bold text-gray-900">
                어제 완료하지 못한 할 일
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              {yesterdayTodos.length}개
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* 내용 */}
      {isExpanded && (
        <>
          {/* 할 일 목록 */}
          <div>
            {yesterdayTodos.map((todo) => {
              const { text, time } = parseTimeFromContent(todo.content);

              return (
                <div
                  key={todo.id}
                  className="border-b border-gray-200 last:border-0 px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* 체크박스 */}
                    <button
                      onClick={() => toggleSelect(todo.id)}
                      className={`mt-1 w-4 h-4 rounded border flex-shrink-0 ${
                        selectedIds.has(todo.id)
                          ? "bg-blue-500 border-blue-500"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      {selectedIds.has(todo.id) && (
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
                    <div
                      className="w-1 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "#fff334" }}
                    />

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-600">{text}</p>
                      {time && (
                        <p className="text-sm text-gray-400 mt-1">{time}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 푸터 */}
          <div className="bg-gray-50 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={toggleSelectAll}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                전체 선택
              </button>
              <span className="text-gray-600">{selectedIds.size}개 선택됨</span>
            </div>

            <button
              onClick={moveToToday}
              disabled={selectedIds.size === 0 || isMoving}
              className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedIds.size === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              {isMoving
                ? "추가 중..."
                : `오늘 할 일로 추가하기 (${selectedIds.size})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
