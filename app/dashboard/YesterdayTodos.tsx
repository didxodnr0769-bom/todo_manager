"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface Todo {
  id: string;
  content: string;
  isCompleted: boolean;
  date: string;
  createdAt: string;
}

export default function YesterdayTodos() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(true);
  const queryClient = useQueryClient();

  // 어제 날짜 계산
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  const yesterdayDate = getYesterdayDate();
  const today = new Date().toISOString().split("T")[0];

  // 어제의 미완료 할 일 조회 (TanStack Query)
  const { data: yesterdayTodos = [] } = useQuery({
    queryKey: ["yesterday-todos", yesterdayDate],
    queryFn: async () => {
      const response = await fetch(`/api/todos?date=${yesterdayDate}`);
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      // 미완료 항목만 필터링
      return data.filter((todo: Todo) => !todo.isCompleted) as Todo[];
    },
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 오늘로 이동 Mutation
  const moveToTodayMutation = useMutation({
    mutationFn: async (selectedTodos: Todo[]) => {
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
    },
    onSuccess: () => {
      // 오늘의 할 일 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["todos", today] });
      toast.success(`${selectedIds.size}개의 할 일이 오늘로 추가되었습니다!`);
      setSelectedIds(new Set()); // 선택 초기화
    },
    onError: (err) => {
      toast.error("오늘 할 일로 추가하는데 실패했습니다.");
      console.error(err);
    },
  });

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
  const moveToToday = () => {
    if (selectedIds.size === 0) return;

    const selectedTodos = yesterdayTodos.filter((todo) =>
      selectedIds.has(todo.id)
    );

    moveToTodayMutation.mutate(selectedTodos);
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

  if (yesterdayTodos.length === 0) {
    return null;
  }

  return (
    <div className="glass-effect-strong rounded-3xl glass-shadow overflow-hidden">
      {/* 헤더 */}
      <div
        className="border-b border-gray-300/30 px-6 py-4 cursor-pointer hover:bg-white/20 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              <h3 className="text-base font-bold text-gray-700">
                어제 완료하지 못한 할 일
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-yellow-200 text-yellow-700 text-xs font-bold rounded-full">
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
                  className="border-b border-gray-200/30 last:border-0 px-6 py-3 hover:bg-white/20 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    {/* 체크박스 */}
                    <button
                      onClick={() => toggleSelect(todo.id)}
                      className={`mt-1 w-4 h-4 rounded border flex-shrink-0 transition-all duration-200 ${
                        selectedIds.has(todo.id)
                          ? "bg-pink-300 border-pink-300"
                          : "bg-white/40 border-gray-400 hover:bg-white/60"
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
                      <p className="text-base text-gray-700">{text}</p>
                      {time && (
                        <p className="text-sm text-gray-500 mt-1">{time}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 푸터 */}
          <div className="bg-white/10 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={toggleSelectAll}
                className="text-gray-600 hover:text-gray-700 transition-colors"
              >
                전체 선택
              </button>
              <span className="text-gray-600">{selectedIds.size}개 선택됨</span>
            </div>

            <button
              onClick={moveToToday}
              disabled={selectedIds.size === 0 || moveToTodayMutation.isPending}
              className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                selectedIds.size === 0
                  ? "bg-white/20 text-gray-400 cursor-not-allowed"
                  : "glass-effect-strong text-gray-700 hover:glass-effect-light glass-shadow"
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              {moveToTodayMutation.isPending
                ? "추가 중..."
                : `오늘 할 일로 추가하기 (${selectedIds.size})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
