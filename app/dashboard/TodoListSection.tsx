"use client";

import { useState } from "react";
import { Plus, CheckSquare, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddTodoDialog from "./AddTodoDialog";
import { getTodos, addTodo, toggleTodo, deleteTodo } from "@/app/actions/todos";

interface Todo {
  id: string;
  content: string;
  isCompleted: boolean;
  date: Date;
  createdAt: Date;
}

interface TodoListSectionProps {
  selectedDate: string;
}

export default function TodoListSection({
  selectedDate,
}: TodoListSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // To-Do 목록 조회 (TanStack Query)
  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["todos", selectedDate],
    queryFn: () => getTodos(selectedDate),
    staleTime: 60 * 1000, // 1분
  });

  // To-Do 추가 Mutation
  const addTodoMutation = useMutation({
    mutationFn: ({ content, date }: { content: string; date: string }) =>
      addTodo(content, date),
    onMutate: async (newTodo) => {
      // 낙관적 업데이트를 위해 이전 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ["todos", selectedDate] });

      // 이전 데이터 백업
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos", selectedDate]);

      // 낙관적 업데이트
      if (previousTodos) {
        const optimisticTodo: Todo = {
          id: `temp-${Date.now()}`,
          content: newTodo.content,
          isCompleted: false,
          date: new Date(newTodo.date),
          createdAt: new Date(),
        };
        queryClient.setQueryData<Todo[]>(
          ["todos", selectedDate],
          [...previousTodos, optimisticTodo]
        );
      }

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      // 에러 시 롤백
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", selectedDate], context.previousTodos);
      }
      toast.error("할 일 추가에 실패했습니다.");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("할 일이 추가되었습니다!");
    },
    onSettled: () => {
      // 성공/실패와 관계없이 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: ["todos", selectedDate] });
    },
  });

  // To-Do 완료 상태 변경 Mutation
  const toggleTodoMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      toggleTodo(id, isCompleted),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["todos", selectedDate] });

      const previousTodos = queryClient.getQueryData<Todo[]>(["todos", selectedDate]);

      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(
          ["todos", selectedDate],
          previousTodos.map((todo) =>
            todo.id === variables.id
              ? { ...todo, isCompleted: variables.isCompleted }
              : todo
          )
        );
      }

      return { previousTodos };
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", selectedDate], context.previousTodos);
      }
      toast.error("상태 변경에 실패했습니다.");
      console.error(err);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isCompleted ? "할 일을 완료했습니다!" : "할 일을 미완료로 변경했습니다!"
      );
    },
  });

  // To-Do 삭제 Mutation
  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["todos", selectedDate] });

      const previousTodos = queryClient.getQueryData<Todo[]>(["todos", selectedDate]);

      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(
          ["todos", selectedDate],
          previousTodos.filter((todo) => todo.id !== deletedId)
        );
      }

      return { previousTodos };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", selectedDate], context.previousTodos);
      }
      toast.error("할 일 삭제에 실패했습니다.");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("할 일이 삭제되었습니다!");
    },
  });

  // 다이얼로그에서 To-Do 추가
  const handleDialogAdd = async (todoData: {
    content: string;
    startTime?: string;
    endTime?: string;
  }) => {
    const content =
      todoData.startTime && todoData.endTime
        ? `${todoData.content}`
        : todoData.content;

    addTodoMutation.mutate({ content, date: selectedDate });
  };

  // To-Do 완료 상태 변경
  const handleToggleTodo = (id: string, isCompleted: boolean) => {
    toggleTodoMutation.mutate({ id, isCompleted: !isCompleted });
  };

  // To-Do 삭제
  const handleDeleteTodo = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;

  // 시간 파싱 함수 (content에서 시간 정보 추출)
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-300"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 glass-effect-strong border border-red-400/30 rounded-2xl text-red-700 text-sm glass-shadow">
        할 일 목록을 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 일정 추가 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 glass-effect-strong text-gray-700 rounded-2xl hover:glass-effect-light transition-all duration-300 text-sm font-medium glass-shadow"
        >
          <Plus className="w-4 h-4" />
          일정 추가
        </button>
      </div>

      {/* To-Do 리스트 카드 */}
      <div className="glass-effect-strong rounded-3xl glass-shadow overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-gray-300/30 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-5 h-5 text-gray-700" />
            <h3 className="text-base font-bold text-gray-700">To Do</h3>
          </div>
          <p className="text-sm text-gray-600">
            완료 : {completedCount}/{todos.length}
          </p>
        </div>

        {/* To-Do 아이템 목록 */}
        {todos.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            오늘의 할 일이 없습니다.
          </div>
        ) : (
          <div>
            {todos.map((todo) => {
              const { text, time } = parseTimeFromContent(todo.content);
              return (
                <div
                  key={todo.id}
                  className="border-b border-gray-200/30 last:border-0 px-6 py-4 hover:bg-white/20 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    {/* 체크박스 */}
                    <button
                      onClick={() =>
                        handleToggleTodo(todo.id, todo.isCompleted)
                      }
                      className={`mt-1 w-4 h-4 rounded border flex-shrink-0 transition-all duration-200 ${
                        todo.isCompleted
                          ? "bg-pink-300 border-pink-300"
                          : "bg-white/40 border-gray-400 hover:bg-white/60"
                      }`}
                    >
                      {todo.isCompleted && (
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

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-base ${
                          todo.isCompleted
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        {text}
                      </p>
                      {time && (
                        <p className="text-sm text-gray-500 mt-1">{time}</p>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all duration-200 flex-shrink-0"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 일정 추가 다이얼로그 */}
      <AddTodoDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleDialogAdd}
      />
    </div>
  );
}
