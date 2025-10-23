"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, CheckSquare, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  // To-Do 목록 조회
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const data = await getTodos(selectedDate);
      setTodos(data);
      setError(null);
    } catch (err) {
      setError("할 일 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 다이얼로그에서 To-Do 추가
  const handleDialogAdd = async (todoData: {
    content: string;
    startTime?: string;
    endTime?: string;
  }) => {
    try {
      const content =
        todoData.startTime && todoData.endTime
          ? `${todoData.content}`
          : todoData.content;

      startTransition(async () => {
        const createdTodo = await addTodo(content, selectedDate);
        setTodos([...todos, createdTodo]);
        setError(null);
      });
    } catch (err) {
      setError("할 일 추가에 실패했습니다.");
      console.error(err);
    }
  };

  // To-Do 완료 상태 변경 (낙관적 업데이트)
  const handleToggleTodo = async (id: string, isCompleted: boolean) => {
    // 1. 현재 상태 백업 (롤백용)
    const previousTodos = [...todos];

    // 2. 즉시 UI 업데이트 (낙관적)
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
    ));
    setError(null);

    // 3. 백그라운드에서 서버 요청
    try {
      await toggleTodo(id, !isCompleted);
      // 성공 시 토스트 메시지
      toast.success(!isCompleted ? "할 일을 완료했습니다!" : "할 일을 미완료로 변경했습니다!");
    } catch (err) {
      // 4. 실패 시 롤백
      setTodos(previousTodos);
      setError("할 일 상태 변경에 실패했습니다.");
      toast.error("상태 변경에 실패했습니다.");
      console.error(err);
    }
  };

  // To-Do 삭제
  const handleDeleteTodo = async (id: string) => {
    try {
      startTransition(async () => {
        await deleteTodo(id);
        setTodos(todos.filter((todo) => todo.id !== id));
        setError(null);
      });
    } catch (err) {
      setError("할 일 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 일정 추가 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          일정 추가
        </button>
      </div>

      {/* To-Do 리스트 카드 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-5 h-5 text-gray-700" />
            <h3 className="text-base font-bold text-gray-900">To Do</h3>
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
                  className="border-b border-gray-200 last:border-0 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {/* 체크박스 */}
                    <button
                      onClick={() =>
                        handleToggleTodo(todo.id, todo.isCompleted)
                      }
                      className={`mt-1 w-4 h-4 rounded border flex-shrink-0 ${
                        todo.isCompleted
                          ? "bg-blue-500 border-blue-500"
                          : "bg-gray-100 border-gray-400"
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
                            : "text-gray-900"
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
                      className="opacity-0 group-hover:opacity-100 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all flex-shrink-0"
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
